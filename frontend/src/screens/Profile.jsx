import { useState, useEffect } from "react";
import CreateProductForm from "../components/profile/CreateProductForm";
import EditProductForm from "../components/profile/EditProductForm";
import ProductCard from "../components/profile/ProductCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import axios from "axios";
import { Products_Mockeados } from "../constants/const";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Profile = () => {
  const redirect = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const token = localStorage.getItem("token");
      
      if (userData && userData.id) {
        const response = await axios.get(
          `http://localhost:3000/api/products/user/${userData.id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error de fetching de productos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleDelete = async (id) => {
    const response = await Swal.fire({
      title: 'Advertencia',
      text: '¿Está seguro que quiere eliminar el producto?',
      icon: 'question',
      showDenyButton: true,
      denyButtonText: "No",
      confirmButtonText: 'Sí',
      confirmButtonColor: '#2563eb',
    });
  
    if (response.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/products/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
        Swal.fire({
          title: 'Éxito',
          text: 'El producto se eliminó correctamente',
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      } catch (error) {
        console.error("Error eliminando producto:", error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el producto.',
          icon: 'error',
          confirmButtonColor: '#2563eb',
        });
      }
    } 
    else if (response.isDenied) {
      Swal.fire({
        title: 'Información',
        text: 'El producto no se eliminó.',
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
      await axios.put(`http://localhost:3000/api/products/${updatedProduct.id}`, updatedProduct);
      const updatedProducts = products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setProducts(updatedProducts);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error actualizando producto:", error);
    }
  };

  const handlePublish = (product) => {
    const imageUrl = `http://localhost:3000/${product.image_url.replace(/\\/g, '/')}`;
  
    const newProduct = {
      id: Products_Mockeados.length + 1,
      category: product.category,
      name: product.title,
      description: product.description,
      price: product.price,
      rating: 0,
      comments: 0,
      likes: 0,
      image: imageUrl, 
    };
    
    Products_Mockeados.push(newProduct);
    Swal.fire({
      title: 'Operación exitosa!',
      text: 'Producto publicado',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb'
    })
    redirect("/home");
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-light)' }}>
      <ProfileHeader />
      <div className="flex justify-start mb-4">
        <CreateProductForm handleCreateProduct={handleCreateProduct} />
      </div>
      <div className="mb-4">
        {editingProduct ? (
          <EditProductForm
            editingProduct={editingProduct}
            handleUpdate={handleUpdate}
            setEditingProduct={setEditingProduct}
          />
        ) : null}
      </div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>Mis Productos</h3>

      <h2 className="text-4xl font-semibold mb-4 animate-flip-down animate-duration-[3000ms] animate-delay-[3000ms]">Productos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-flip-down animate-duration-[3000ms] animate-delay-[3000ms]">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handlePublish={handlePublish}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;
