import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar.jsx';
import SearchBar from '../components/home/SearchBar';
import ItemCard from '../components/home/ItemCard';
import axios from 'axios';
import Swal from 'sweetalert2';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const guestMode = localStorage.getItem("guest") === "true";
    setIsGuest(guestMode);

    // Si es invitado, mostramos un aviso informativo
    if (guestMode) {
      Swal.fire({
        title: 'Modo invitado',
        text: 'Estás navegando como invitado. Solo puedes visualizar los productos.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2563eb'
      });
    }
    // Traer productos desde backend
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/allproducts', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        // Filtrar solo productos publicados
        const published = res.data.filter(p => p.is_published === true);
        // Mapear estructura del backend a la estructura esperada por ItemCard
        const mapped = published.map(p => ({
          id: p.id,
          category: p.category,
          name: p.title,
          description: p.description,
          price: `$${p.price}`,
          rating: 4.0,
          comments: 0,
          likes: 0,
          image: p.image_url ? `http://localhost:3000/${p.image_url.replace(/\\/g, '/')}` : '/imghome/default.png',
          user_id: p.user_id
        }));
        setProducts(mapped);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchProducts();
  }, []);

  const filteredItems = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50">
      <NavBar isGuest={isGuest} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6 animate-fade-down animate-duration-[2000ms] animate-delay-[2000ms]">
          Productos disponibles
        </h1>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Aviso si es modo invitado */}
        {isGuest && (
          <div className="text-center mb-4 bg-yellow-100 border border-yellow-300 text-yellow-700 py-2 rounded-lg font-semibold">
            Estás en modo invitado. No puedes subir, editar ni eliminar productos.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              isGuest={isGuest} 
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;

