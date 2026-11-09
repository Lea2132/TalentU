import { FaHeadset } from 'react-icons/fa';
import { MdPalette } from 'react-icons/md';
import { ChevronDown, Home as HomeIcon, MessageCircle } from 'lucide-react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import logo from "../assets/image.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";
import { SERVICE_CATEGORIES } from "../constants/serviceCategories";

const NavBar = () => {
  const redirect = useNavigate();
  const location = useLocation();
  const { handleThemeChange } = useContext(ThemeContext);
  const [isGuest, setIsGuest] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Detecta si está en modo invitado o si hay usuario logueado
    const guestFlag = localStorage.getItem("guest") === "true";
    setIsGuest(guestFlag);

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || localStorage.getItem('guest') === 'true') {
      setUnreadMessages(0);
      return undefined;
    }

    let active = true;
    const fetchUnreadMessages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`No se pudieron consultar mensajes (${response.status})`);
        const conversations = await response.json();
        if (active) {
          setUnreadMessages(
            conversations.reduce((total, conversation) => total + Number(conversation.unread_count || 0), 0)
          );
        }
      } catch (error) {
        console.error('Error al consultar mensajes sin leer:', error);
      }
    };

    fetchUnreadMessages();
    const intervalId = window.setInterval(fetchUnreadMessages, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [location.pathname]);

  const handleNavigate = (path) => {
    redirect(path);
  };

  const navigateToCategory = (category) => {
    handleNavigate(`/home?categoria=${encodeURIComponent(category)}#catalogo`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: isGuest ? "Salir del modo invitado" : "Cerrar sesión",
      text: isGuest
        ? "¿Deseas salir del modo invitado y volver al inicio?"
        : "¿Deseas cerrar tu sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("guest");
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("isAdmin");
        redirect("/");
      }
    });
  };

  return (
    <Navbar
      className="mx-auto mt-4 max-w-[95%] rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-md animate-fade-down animate-duration-[1000ms] animate-delay-[1000ms]"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }}
    >
      {/* Logo y título */}
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4 gap-2 sm:mr-8 sm:gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--color-light)' }}
          >
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap text-lg font-black tracking-tight" style={{ color: 'var(--color-primary)' }}>
              TalentU
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
              Comunidad universitaria
            </span>
          </span>
        </NavbarBrand>

        <NavbarContent className="hidden gap-1 sm:flex">
          <NavbarItem>
            <Link
              className={`cursor-pointer rounded-xl px-3 py-2 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/home' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
              onClick={() => handleNavigate('/home')}
            >
              <HomeIcon className="mr-1 inline h-4 w-4" />
              Inicio
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <button className="flex items-center rounded-xl px-3 py-2 font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700">
                  Categorías <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Categorías de servicios">
                <DropdownItem key="all" onPress={() => handleNavigate('/home#catalogo')}>
                  Todas las categorías
                </DropdownItem>
                {SERVICE_CATEGORIES.map((category) => (
                  <DropdownItem key={category} onPress={() => navigateToCategory(category)}>
                    {category}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent className="flex sm:hidden">
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center rounded-xl bg-blue-50 px-3 py-2 font-semibold text-blue-700">
                Explorar <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Explorar TalentU">
              <DropdownItem key="home" onPress={() => handleNavigate('/home')}>
                Inicio
              </DropdownItem>
              <DropdownItem key="all-mobile" onPress={() => handleNavigate('/home#catalogo')}>
                Todas las categorías
              </DropdownItem>
              {SERVICE_CATEGORIES.map((category) => (
                <DropdownItem key={`${category}-mobile`} onPress={() => navigateToCategory(category)}>
                  {category}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {/* 🔹 Si NO es invitado, mostrar el resto del menú */}
        {!isGuest && (
          <NavbarContent className="hidden gap-1 sm:flex">
            <NavbarItem>
              <Link
                className={`cursor-pointer rounded-xl px-3 py-2 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/chat' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
                onClick={() => handleNavigate('/chat')}
              >
                <MessageCircle className="mr-1 inline h-4 w-4" />
                Mensajes
                {unreadMessages > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                className={`cursor-pointer rounded-xl px-3 py-2 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
                onClick={() => handleNavigate('/profile')}
              >
                Perfil
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                className={`cursor-pointer rounded-xl px-3 py-2 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/notices' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
                onClick={() => handleNavigate('/notices')}
              >
                Noticias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                className={`cursor-pointer rounded-xl px-3 py-2 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700 ${location.pathname === '/opciones' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'}`}
                onClick={() => handleNavigate('/opciones')}
              >
                Opciones
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}

        {/* 🔹 Ayuda siempre visible */}
        <NavbarContent className="hidden gap-1 sm:flex">
          <NavbarItem>
            <Link
              className="cursor-pointer rounded-xl px-3 py-2 font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              onClick={() => handleNavigate('/chatbot')}
            >
              Ayuda <FaHeadset className="inline ml-1 text-blue-700" />
            </Link>
          </NavbarItem>

          {/* Theme Switcher */}
          <Dropdown>
            <DropdownTrigger>
              <button
                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                aria-label="Cambiar tema"
              >
                <MdPalette size={24} />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Theme Selection">
              <DropdownItem 
                key="blue"
                onPress={() => handleThemeChange('blue')}
                textValue="Azul"
              >
                🔵 Azul (Actual)
              </DropdownItem>
              <DropdownItem 
                key="green"
                onPress={() => handleThemeChange('green')}
                textValue="Verde"
              >
                🟢 Verde (Original)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </NavbarContent>

      {/* 🔹 Menú de usuario o botón salir */}
      <NavbarContent as="div" className="items-center" justify="end">
        {!isGuest ? (
          // Menú normal (usuarios logueados)
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform hover:scale-105"
                color="primary"
                name={userData ? userData.name : "Usuario"}
                size="sm"
                src="https://tse4.explicit.bing.net/th?id=OIP.awAiMS1BCAQ2xS2lcdXGlwHaHH&pid=Api&P=0&h=180"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">
                  {userData ? userData.name : "Usuario"}
                </p>
                <p className="font-semibold text-xs text-gray-500">
                  {userData ? userData.email : ""}
                </p>
              </DropdownItem>
              <DropdownItem key="mi-perfil" onPress={() => handleNavigate('/profile')}>
                Mi perfil
              </DropdownItem>
              <DropdownItem key="mensajes" onPress={() => handleNavigate('/chat')}>
                Mensajes{unreadMessages > 0 ? ` (${unreadMessages} sin leer)` : ''}
              </DropdownItem>
              <DropdownItem key="noticias" onPress={() => handleNavigate('/notices')}>
                Noticias
              </DropdownItem>
              <DropdownItem key="opciones" onPress={() => handleNavigate('/opciones')}>
                Opciones
              </DropdownItem>
              <DropdownItem key="logout" onPress={handleLogout} color="danger">
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          // Botón especial para invitados
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg transition duration-300"
          >
            Salir del modo invitado
          </button>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default NavBar;
