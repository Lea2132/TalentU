import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  Clock3,
  Heart,
  Search,
  Sparkles,
  Star,
  Store,
  Users,
} from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/NavBar.jsx';
import ItemCard from '../components/home/ItemCard';
import { SERVICE_CATEGORIES } from '../constants/serviceCategories';

const API_URL = 'http://localhost:3000/api';
const CATEGORIES = ['Todos', ...SERVICE_CATEGORIES];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'rated', label: 'Mejor calificados' },
  { value: 'price-asc', label: 'Tarifa: menor a mayor' },
  { value: 'price-desc', label: 'Tarifa: mayor a menor' },
];

const categoryIcons = {
  [SERVICE_CATEGORIES[0]]: BookOpen,
  [SERVICE_CATEGORIES[1]]: Heart,
  [SERVICE_CATEGORIES[2]]: Sparkles,
};

const getPrice = (price) => Number(String(price).replace(/[^\d.-]/g, '')) || 0;

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(getPrice(price));

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const requestedCategory = searchParams.get('categoria');
  const selectedCategory = CATEGORIES.includes(requestedCategory) ? requestedCategory : 'Todos';
  const [sortBy, setSortBy] = useState('newest');
  const [isGuest, setIsGuest] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setIsGuest(localStorage.getItem('guest') === 'true');

    let active = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/allproducts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!active) return;

        const published = response.data
          .filter((product) => product.is_published === true)
          .map((product) => ({
            id: product.id,
            category: product.category,
            name: product.title,
            description: product.description,
            price: product.price,
            rating: Number(product.rating_avg) || 0,
            ratingsCount: Number(product.ratings_count) || 0,
            userRating: Number(product.user_rating) || 0,
            comments: Number(product.comments_count) || 0,
            likes: Number(product.likes_count) || 0,
            userLiked: product.user_liked === true,
            seller_name: product.seller_name,
            image: product.image_url
              ? `http://localhost:3000/${product.image_url.replace(/\\/g, '/')}`
              : '/imghome/mekato.png',
            user_id: product.user_id,
            createdAt: product.created_at,
          }));
        setProducts(published);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        if (active) setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('es');
    const matching = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;
      const searchableText = `${product.name} ${product.description} ${product.category}`
        .toLocaleLowerCase('es');
      return matchesCategory && searchableText.includes(normalizedSearch);
    });

    return matching.sort((first, second) => {
      switch (sortBy) {
        case 'popular':
          return second.likes - first.likes || second.comments - first.comments;
        case 'rated':
          return second.rating - first.rating || second.ratingsCount - first.ratingsCount;
        case 'price-asc':
          return getPrice(first.price) - getPrice(second.price);
        case 'price-desc':
          return getPrice(second.price) - getPrice(first.price);
        case 'newest':
        default:
          return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const featuredProduct = useMemo(
    () => [...products].sort((a, b) => b.likes - a.likes || b.rating - a.rating)[0] || null,
    [products]
  );
  const recentProducts = useMemo(
    () => [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3),
    [products]
  );
  const categoryTotals = useMemo(
    () => CATEGORIES.slice(1).map((category) => ({
      name: category,
      count: products.filter((product) => product.category === category).length,
    })),
    [products]
  );

  const selectCategory = (category) => {
    if (category === 'Todos') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: category });
    }
  };

  const showProduct = (product) => {
    setSearchTerm(product.name);
    selectCategory('Todos');
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const categoryCount = (category) =>
    category === 'Todos'
      ? products.length
      : products.filter((product) => product.category === category).length;

  const clearFilters = () => {
    setSearchTerm('');
    selectCategory('Todos');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar isGuest={isGuest} />
      <main className="container mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section
          className="relative isolate overflow-hidden rounded-[2rem] px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14"
          style={{
            background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 58%, color-mix(in srgb, var(--color-primary) 72%, white) 100%)',
          }}
        >
          <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-36 right-1/4 -z-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Sparkles className="h-4 w-4" />
                El talento universitario, más cerca
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Tu talento puede ayudar.
                <br />
                <span style={{ color: 'var(--color-light)' }}>Conecta con tu comunidad.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-blue-50 sm:text-lg">
                Encuentra apoyo para tus materias o servicios para tu día a día, desde clases por hora
                hasta cuidado personal. O comparte lo que sabes y ofrece tu servicio en el campus.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#catalogo"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Explorar servicios
                  <ArrowRight className="h-5 w-5" />
                </a>
                {!isGuest && (
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    <Store className="h-5 w-5" />
                    Ofrecer mi servicio
                  </button>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="mx-auto max-w-sm rotate-2 rounded-3xl border border-white/30 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white" style={{ color: 'var(--color-primary)' }}>
                    <Store className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                    Hecho en el campus
                  </span>
                </div>
                <p className="mt-6 text-sm font-medium text-blue-100">Lo que sabes puede</p>
                <p className="mt-1 text-2xl font-extrabold">hacerle más fácil el camino a alguien.</p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/20 pt-5">
                  <div className="flex -space-x-2">
                    {['bg-amber-300', 'bg-pink-300', 'bg-emerald-300'].map((color, index) => (
                      <span
                        key={color}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-700 ${color} text-sm font-black text-blue-900`}
                        aria-hidden="true"
                      >
                        {['E', 'C', 'S'][index]}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-blue-50">
                    <strong>{products.length}</strong> servicios publicados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {isGuest && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
            <p className="text-sm font-medium">
              Estás navegando como invitado. Puedes explorar; inicia sesión para participar.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-4"
            >
              Iniciar sesión <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <section aria-label="Explora TalentU" className="mt-8 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              selectCategory('Todos');
              setSortBy('newest');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Clock3 className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-slate-900">Lo más nuevo</strong>
              <span className="text-sm text-slate-500">Descubre lo último del campus</span>
            </span>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
          </button>
          <button
            type="button"
            onClick={() => {
              selectCategory('Todos');
              setSortBy('popular');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Heart className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-slate-900">Los favoritos</strong>
              <span className="text-sm text-slate-500">Los más apreciados por estudiantes</span>
            </span>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/notices')}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-slate-900">Vida universitaria</strong>
              <span className="text-sm text-slate-500">Noticias y novedades del TdeA</span>
            </span>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
          </button>
        </section>

        <section id="catalogo" className="scroll-mt-8 pt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
                Servicios de la comunidad
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Encuentra algo especial
              </h2>
              <p className="mt-2 text-slate-600">
                {products.length
                  ? `${products.length} ${products.length === 1 ? 'servicio disponible' : 'servicios disponibles'} para ti`
                  : 'Encuentra clases, asesorías y servicios ofrecidos por estudiantes'}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm sm:self-auto">
              <Store className="h-4 w-4 text-blue-700" />
              Apoya a estudiantes del TdeA
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <label htmlFor="product-search" className="sr-only">Buscar servicios</label>
                <input
                  id="product-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="¿Qué estás buscando? Prueba “postres” o “clases”"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5 shrink-0 text-slate-500" />
                <label htmlFor="product-sort" className="sr-only">Ordenar servicios</label>
                <select
                  id="product-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:w-auto"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
              <h3 className="font-bold text-slate-900">Categorías</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-1">
                {CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  const Icon = categoryIcons[category] || Store;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => selectCategory(category)}
                      aria-pressed={active}
                      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                        active
                          ? 'text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      style={active
                        ? { backgroundColor: 'var(--color-primary)' }
                        : undefined}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        {category}
                      </span>
                      <span className={`text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}>
                        {categoryCount(category)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900">Explorar por</h3>
                <div className="mt-2 space-y-1">
                  {[
                    { value: 'newest', label: 'Más recientes', icon: Clock3 },
                    { value: 'popular', label: 'Más populares', icon: Heart },
                    { value: 'rated', label: 'Mejor calificados', icon: Star },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSortBy(value)}
                      aria-pressed={sortBy === value}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                        sortBy === value
                          ? 'font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      style={sortBy === value ? { color: 'var(--color-primary)' } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl p-3" style={{ backgroundColor: 'var(--color-light)' }}>
                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  <Users className="h-4 w-4" />
                  Hecho por estudiantes
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Cada servicio compartido fortalece el talento de nuestra comunidad.
                </p>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600" aria-live="polite">
              {isLoading
                ? 'Buscando servicios...'
                : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'resultado' : 'resultados'}`}
              {selectedCategory !== 'Todos' ? ` en ${selectedCategory.toLocaleLowerCase('es')}` : ''}
            </p>
            {(searchTerm || selectedCategory !== 'Todos' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
              >
                Limpiar búsqueda y filtros
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-label="Cargando">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  <div className="h-48 animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <p className="text-lg font-bold text-red-800">No pudimos cargar los servicios</p>
              <p className="mt-2 text-sm text-red-700">Revisa tu conexión e inténtalo de nuevo.</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 font-bold text-white transition hover:bg-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : visibleProducts.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {visibleProducts.map((item) => (
                <ItemCard key={item.id} item={{ ...item, price: formatPrice(item.price) }} isGuest={isGuest} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                {products.length ? 'No encontramos coincidencias' : 'El catálogo está empezando'}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                {products.length
                  ? 'Prueba con otra búsqueda o categoría para descubrir más opciones.'
                  : 'Pronto verás aquí clases, asesorías y otros servicios de la comunidad estudiantil.'}
              </p>
              {(searchTerm || selectedCategory !== 'Todos') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
                >
                  Ver todos los servicios
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-6">
              {featuredProduct && (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-4 pb-3 pt-4">
                    <h3 className="font-bold text-slate-900">Destacado del campus</h3>
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <img
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-4">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ backgroundColor: 'var(--color-light)', color: 'var(--color-primary)' }}
                    >
                      {featuredProduct.category}
                    </span>
                    <h4 className="mt-3 line-clamp-1 font-bold text-slate-900">{featuredProduct.name}</h4>
                    <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(featuredProduct.price)}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      {featuredProduct.likes} me gusta
                      {featuredProduct.ratingsCount > 0 && (
                        <>
                          <Star className="ml-2 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {featuredProduct.rating.toFixed(1)}
                        </>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => showProduct(featuredProduct)}
                      className="mt-4 w-full rounded-xl px-3 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      Ver publicación
                    </button>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Recién publicados</h3>
                  <Clock3 className="h-4 w-4 text-slate-400" />
                </div>
                {recentProducts.length ? (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {recentProducts.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => showProduct(product)}
                          className="flex w-full items-center gap-3 py-3 text-left"
                        >
                          <img
                            src={product.image}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-800">{product.name}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{formatPrice(product.price)}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">Las nuevas publicaciones aparecerán aquí.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-bold text-slate-900">La comunidad ofrece</h3>
                <div className="mt-3 space-y-3">
                  {categoryTotals.map(({ name, count }) => {
                    const Icon = categoryIcons[name] || Sparkles;
                    return (
                      <div key={name}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-slate-600">
                            <Icon className="h-3.5 w-3.5" />
                            {name}
                          </span>
                          <span className="font-bold text-slate-800">{count}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${products.length ? (count / products.length) * 100 : 0}%`,
                              backgroundColor: 'var(--color-primary)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section className="mt-14 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                <Star className="h-6 w-6 fill-blue-100" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">¿Ofreces un servicio?</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Comparte tus conocimientos u ofrece un servicio a la comunidad del TdeA. Publícalo desde tu perfil.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(isGuest ? '/' : '/profile')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              {isGuest ? 'Inicia sesión' : 'Empezar ahora'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
