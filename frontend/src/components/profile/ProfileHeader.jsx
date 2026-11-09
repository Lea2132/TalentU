import { MessageCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../config/api'

const ProfileHeader = () => {
  const redirect = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userData, setUserData] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    } catch { return null }
  });

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!userData && token) {
        try {
          const res = await axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
          setUserData(res.data.user);
          localStorage.setItem('userData', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('No se pudo obtener perfil', err);
        }
      }
    };
    fetchMe();
  }, [userData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('guest') === 'true') {
      setUnreadMessages(0);
      return undefined;
    }

    let active = true;
    const fetchUnreadMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setUnreadMessages(
            response.data.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0)
          );
        }
      } catch (error) {
        console.error('No se pudieron consultar mensajes sin leer:', error);
      }
    };

    fetchUnreadMessages();
    const intervalId = window.setInterval(fetchUnreadMessages, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const initials = userData?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

  return (
    <header
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-7"
      style={{ background: 'linear-gradient(120deg, var(--color-secondary), var(--color-primary))' }}
    >
      <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-xl font-black shadow-inner sm:h-20 sm:w-20 sm:text-2xl"
            aria-label={`Iniciales de ${userData?.name || 'Usuario'}`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/75">Mi perfil</p>
            <h2 className="mt-1 truncate text-2xl font-black leading-tight sm:text-3xl">
              {userData ? userData.name : 'Usuario'}
            </h2>
            <p className="mt-1 truncate text-sm font-medium text-white/85 sm:text-base">
              {userData ? userData.email : 'Gestiona tu actividad en TalentU'}
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => redirect('/home')}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 sm:flex-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a inicio</span>
          </button>
          <button
            type="button"
            onClick={() => redirect('/chat')}
            aria-label={unreadMessages ? `Abrir mensajes, ${unreadMessages} sin leer` : 'Abrir mensajes'}
            className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold transition hover:bg-white/90"
            style={{ color: 'var(--color-primary)' }}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Mensajes</span>
            {unreadMessages > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default ProfileHeader
