import { FaHeadset } from 'react-icons/fa';
import { MdPalette } from 'react-icons/md';
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
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";

const NavBar = () => {
  const redirect = useNavigate();
  const { theme, handleThemeChange } = useContext(ThemeContext);
  const [isGuest, setIsGuest] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Detecta si está en modo invitado o si hay usuario logueado
    const guestFlag = localStorage.getItem("guest") === "true";
    setIsGuest(guestFlag);

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  const handleNavigate = (path) => {
    redirect(path);
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
        localStorage.removeItem("userData");
        localStorage.removeItem("isAdmin");
        redirect("/");
      }
    });
  };

  return (
    <Navbar className="bg-blue-700 shadow-2xl mt-4 mx-auto max-w-[95%] rounded-md animate-fade-down animate-duration-[1000ms] animate-delay-[1000ms]">
      {/* Logo y título */}
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          <img src={logo} alt="Logo" className="w-8 h-auto mr-2" />
          <p className="sm:block font-bold text-inherit text-white">SERVICAMPUS</p>
        </NavbarBrand>

        {/* 🔹 Si NO es invitado, mostrar el resto del menú */}
        {!isGuest && (
          <NavbarContent className="hidden sm:flex gap-3">
            <NavbarItem>
              <Link
                className="font-semibold text-white cursor-pointer"
                onClick={() => handleNavigate('/profile')}
              >
                Perfil
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                className="font-semibold text-white cursor-pointer"
                onClick={() => handleNavigate('/notices')}
              >
                Noticias
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                className="font-semibold text-white cursor-pointer"
                onClick={() => handleNavigate('/opciones')}
              >
                Opciones
              </Link>
            </NavbarItem>
          </NavbarContent>
        )}

        {/* 🔹 Ayuda siempre visible */}
        <NavbarContent className="hidden sm:flex gap-3">
          <NavbarItem>
            <Link
              className="font-semibold text-white cursor-pointer"
              onClick={() => handleNavigate('/chatbot')}
            >
              Ayuda <FaHeadset className="text-white inline ml-1" />
            </Link>
          </NavbarItem>

          {/* Theme Switcher */}
          <Dropdown>
            <DropdownTrigger>
              <button className="text-white hover:text-blue-100 transition">
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
                className="transition-transform"
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
