import { User, MessageCircle } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext'
import axios from 'axios'

const ProfileHeader = () => {
  const redirect = useNavigate();
  const [userData, setUserData] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    } catch (e) { return null }
  });

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!userData && token) {
        try {
          const res = await axios.get('http://localhost:3000/api/me', { headers: { Authorization: `Bearer ${token}` } });
          setUserData(res.data.user);
          localStorage.setItem('userData', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('No se pudo obtener perfil', err);
        }
      }
    };
    fetchMe();
  }, []);

  const handleNavigate = (path) => {
    redirect(path);
  };

  return (
    <div className="shadow-lg rounded-lg p-4 flex items-center justify-between mb-8 max-w-[95%] mx-auto animate-fade-down animate-duration-[1000ms] animate-delay-[1000ms]" style={{ backgroundColor: 'var(--color-primary)' }}>
      {/* Lado izquierdo de la seccion imagen de perfil y informacion del usuario */}
      <div className="flex items-center space-x-6">
        <div className="rounded-full p-4 shadow-md" style={{ backgroundColor: 'var(--color-light)' }}>
          <User className="w-12 h-12" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight">{userData ? userData.name : 'Usuario'}</h2>
          <p className="text-md text-white font-semibold">{userData ? userData.email : ''}</p>
        </div>
      </div>

      {/* Lado derecho icono de mensajes */}
      <a
        onClick={()=>handleNavigate("/chat")}
        className="transition duration-300 ease-in-out flex items-center space-x-2 p-3 rounded-full shadow-md hover:shadow-lg cursor-pointer text-white hover:opacity-80" 
        style={{ backgroundColor: 'var(--color-light)' }}
      >
        <MessageCircle className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
      </a>
    </div>
  )
}

export default ProfileHeader
