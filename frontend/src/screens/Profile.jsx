import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, BriefcaseBusiness, Eye, EyeOff, Plus, Store } from "lucide-react";
import CreateProductForm from "../components/profile/CreateProductForm";
import EditProductForm from "../components/profile/EditProductForm";
import ProductCard from "../components/profile/ProductCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import axios from "axios";
import Swal from "sweetalert2";
import { SERVICE_CATEGORIES } from "../constants/serviceCategories";
import { API_URL } from "../config/api";

const Profile = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const token = localStorage.getItem("token");
      
      if (userData && userData.id) {
        const response = await axios.get(
          `${API_URL}/products/user/${userData.id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProducts(response.data);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handlePublishChange = (productId, isPublished) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, is_published: isPublished } : product
      )
    );
  };

  const visibleProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesSearch = `${product.title} ${product.description} ${product.category}`
        .toLocaleLowerCase("es")
        .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const publishedCount = products.filter((product) => product.is_published).length;
  const draftCount = products.length - publishedCount;
  const categories = ["Todos", ...SERVICE_CATEGORIES];

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id) => {
    const response = await Swal.fire({
      title: 'Advertencia',
      text: '¿Seguro que quieres eliminar esta publicación de servicio?',
      icon: 'question',
      showDenyButton: true,
      denyButtonText: "No",
      confirmButtonText: 'Sí',
      confirmButtonColor: '#2563eb',
    });
  
    if (response.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
        Swal.fire({
          title: 'Éxito',
          text: 'El servicio se eliminó correctamente',
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      } catch (error) {
        console.error("Error al eliminar el servicio:", error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el servicio.',
          icon: 'error',
          confirmButtonColor: '#2563eb',
        });
      }
    } 
    else if (response.isDenied) {
      Swal.fire({
        title: 'Información',
        text: 'El servicio no se eliminó.',
        icon: 'info',
        confirmButtonColor: '#2563eb',
      });
    } 
    else {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado.',
        icon: 'error',
        confirmButtonColor: '#2563eb',
      });
    }
  };

  const handleUpdate = async (updatedProduct) => {
    try {
      await axios.put(`${API_URL}/products/${updatedProduct.id}`, updatedProduct);
      const updatedProducts = products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error al actualizar el servicio:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader />

        <section className="relative mt-8 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div
            className="absolute inset-y-0 right-0 hidden w-1/3 opacity-10 sm:block"
            style={{ background: "linear-gradient(135deg, transparent, var(--color-primary))" }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: "var(--color-light)", color: "var(--color-primary)" }}
              >
                <Store className="h-4 w-4" />
                Mi espacio
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Tus servicios
              </h1>
              <p className="mt-2 leading-6 text-slate-600">
                Administra tus publicaciones, actualiza tus servicios y comparte tu talento con la comunidad.
              </p>
            </div>
            <div className="shrink-0">
              <CreateProductForm handleCreateProduct={handleCreateProduct} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Resumen de servicios">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-light)", color: "var(--color-primary)" }}>
              <BriefcaseBusiness className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Total de servicios</p>
              <p className="text-2xl font-black text-slate-900">{products.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Eye className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Publicados</p>
              <p className="text-2xl font-black text-slate-900">{publishedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <EyeOff className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Sin publicar</p>
              <p className="text-2xl font-black text-slate-900">{draftCount}</p>
            </div>
          </div>
        </section>

        {editingProduct && (
          <div className="mt-6">
            <EditProductForm
              editingProduct={editingProduct}
              handleUpdate={handleUpdate}
              setEditingProduct={setEditingProduct}
            />
          </div>
        )}

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: "var(--color-primary)" }}>
                Panel de gestión
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Mis servicios</h2>
            </div>
            {!isLoading && !loadError && (
              <p className="text-sm text-slate-500">
                Mostrando <strong className="text-slate-800">{visibleProducts.length}</strong> de {products.length}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <label htmlFor="profile-product-search" className="sr-only">Buscar en mis servicios</label>
              <input
                id="profile-product-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, descripción o categoría..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar mis servicios por categoría">
              {categories.map((category) => {
                const count = category === "Todos"
                  ? products.length
                  : products.filter((product) => product.category === category).length;
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    style={active
                      ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" }
                      : undefined}
                  >
                    {category} <span className={active ? "ml-1 text-white/80" : "ml-1 text-slate-400"}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando servicios">
              {[1, 2, 3].map((item) => (
                <div key={item} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="h-48 animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
              <p className="font-bold text-red-800">No pudimos cargar tus servicios.</p>
              <button
                type="button"
                onClick={fetchProducts}
                className="mt-3 font-semibold text-red-800 underline underline-offset-4"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : visibleProducts.length ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  onPublishChange={handlePublishChange}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "var(--color-light)", color: "var(--color-primary)" }}
              >
                {products.length ? <Search className="h-8 w-8" /> : <BriefcaseBusiness className="h-8 w-8" />}
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {products.length ? "No encontramos servicios" : "Aún no tienes servicios"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                {products.length
                  ? "Prueba con otra búsqueda o selecciona una categoría diferente."
                  : "Crea tu primera publicación y empieza a ofrecer tus servicios en TalentU."}
              </p>
              {products.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todos");
                  }}
                  className="mt-5 font-bold underline underline-offset-4"
                  style={{ color: "var(--color-primary)" }}
                >
                  Limpiar filtros
                </button>
              ) : (
                <div className="mt-5 inline-flex items-center gap-2 font-semibold" style={{ color: "var(--color-primary)" }}>
                  <Plus className="h-5 w-5" />
                  Usa “Ofrecer un servicio” para comenzar
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;
