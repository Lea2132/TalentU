import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { MdPalette } from "react-icons/md";
import { useState, useContext } from "react";
import Swal from "sweetalert2";
import { ThemeContext } from "../context/ThemeContext";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";

const Login = () => {
  const redirect = useNavigate();
  const { theme, handleThemeChange } = useContext(ThemeContext);

  const {
    register: login,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Función de inicio de sesión normal
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", data);
      reset();

      // ✅ Si inicia sesión normal, eliminamos el modo invitado
      localStorage.removeItem("guest");
        // Guardar token y datos de usuario en localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("isAdmin", res.data.isAdmin);
        localStorage.setItem("userData", JSON.stringify(res.data.user));

      // Si es administrador, mostrar opción de elegir entre admin o usuario normal
      if (res.data.isAdmin) {
        Swal.fire({
          title: 'Bienvenido Admin',
          text: '¿Deseas ingresar como administrador o como usuario normal?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Como Administrador',
          cancelButtonText: 'Como Usuario Normal',
          confirmButtonColor: 'var(--color-primary)',
          cancelButtonColor: '#6b7280'
        }).then((result) => {
          if (result.isConfirmed) {
            // Entrar como admin
            redirect("/admin");
          } else {
            // Entrar como usuario normal
            localStorage.setItem("isAdmin", false);
            redirect("/home");
          }
        });
      } else {
        // Usuario normal
        redirect("/home");
        Swal.fire({
          title: 'Operación exitosa!',
          text: 'Inicio de sesión exitoso',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--color-primary)'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Correo o contraseña incorrecta',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'red'
      });
      console.log("Error", error.response?.data);
    }
  });

  // 🔹 Función para modo invitado
  const handleGuestLogin = () => {
    Swal.fire({
      title: 'Ingresando como invitado',
      text: 'Podrás explorar los servicios publicados por la comunidad',
      icon: 'info',
      confirmButtonColor: '#28a745'
    }).then(() => {
      // Guardamos un flag en localStorage para saber que es invitado
      localStorage.setItem("guest", "true");
      redirect("/home");
    });
  };

  const errorMessages = Object.values(errors).map((error) => error.message);

  return (
    <section
      className="flex h-screen"
      style={{ backgroundImage: `url(/img/fondov4.png)` }}
    >
      {/* Lado izquierdo */}
      <div className="hidden md:flex flex-1 rounded-lg items-center justify-center p-10 animate-jump animate-once animate-duration-[3000ms] animate-delay-[2000ms]" style={{ backgroundImage: `linear-gradient(135deg, ${theme === 'green' ? '#10b981' : '#1e3a8a'} 0%, ${theme === 'green' ? '#d1fae5' : '#87ceeb'} 100%)` }}>
        <div className="text-center">
          <img
            src="../../public/img/fondov2.png"
            alt="Logo"
            style={{ width: '700px', height: 'auto' }}
          />
          <br /><br /><br /><br />
          <h1 className="text-4xl font-extrabold mb-4 text-white text-login-left animate-duration-[2000ms] animate-delay-[2000ms]">
            Bienvenidos a TalentU
          </h1>
            <p className="text-xl mb-4 font-semibold text-login-left animate-duration-[2000ms] animate-delay-[2000ms]" style={{ color: 'var(--color-secondary)' }}>
            Olvídate de las limitaciones para ofertar tus servicios en la universidad 👌
          </p>
            <p className="text-lg font-bold text-login-left animate-duration-[2000ms] animate-delay-[2000ms]" style={{ color: 'var(--color-primary)' }}>
            Ingresa y oferta o mira servicios ofrecidos por otros estudiantes
          </p>
        </div>
      </div>

      {/* Lado derecho con la imagen de fondo y el formulario centrado */}
      <div
        className="flex flex-1 items-center justify-center bg-cover bg-left-center relative"
        style={{ backgroundImage: `url(/img/fondov1.png)` }}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          {/* Título solo en móviles */}
            <h1 className="text-3xl font-extrabold mb-6 text-center block md:hidden form-login" style={{ color: 'var(--color-primary)' }}>
            Bienvenidos
            <p>TalentU</p>
          </h1>

          <form onSubmit={onSubmit} className="form-login">
            <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>Iniciar Sesión</h2>

            <div className="mb-4 relative">
              <input
                type="email"
                {...login("email", {
                  required: "Email requerido",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    message: "Email inválido",
                  },
                })}
                placeholder="Email"
                className="inputs-login pl-10"
              />
            </div>

            <div className="mb-6 relative">
              <input
                type={showPassword ? "text" : "password"}
                {...login("password", {
                  required: "Contraseña requerida",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe contener al menos 6 caracteres",
                  },
                })}
                placeholder="Contraseña"
                className="inputs-login pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                 className="absolute right-4 top-4"
                 style={{ color: 'var(--color-primary)' }}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            {errorMessages.length > 0 && (
              <div className="mb-4 text-red-600 font-semibold">
                {errorMessages.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            )}

            {/* 🔹 Botón de iniciar sesión */}
            <button type="submit" className="button-login w-full">Iniciar Sesión</button>

            {/* 🔹 Nuevo botón de invitado */}
            <button
              type="button"
              onClick={handleGuestLogin}
                className="mt-3 w-full font-semibold py-2 rounded-lg transition duration-300"
                style={{ backgroundColor: 'var(--color-light)', color: 'var(--color-primary)' }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Ingresar como invitado
            </button>

            <div className="mt-4 text-center">
              <h1 className="font-semibold">¿No tienes una cuenta?</h1>
              <Link to="/register" className="text-base transition-colors duration-300 ease-in-out relative group font-bold" style={{ color: 'var(--color-primary)' }}>
                Crear una cuenta
                <span className="absolute left-0 bottom-0 w-0.5 h-0.5 transition-all duration-300 ease-in-out group-hover:w-full" style={{ backgroundColor: 'var(--color-secondary)' }}></span>
              </Link>
            </div>

            {/* 🔹 Theme Switcher */}
            <div className="mt-6 flex justify-center">
              <Dropdown>
                <DropdownTrigger>
                  <button className="p-2 rounded-lg transition" style={{ backgroundColor: 'var(--color-light)', color: 'var(--color-primary)' }}>
                    <MdPalette size={20} />
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Theme Selection">
                  <DropdownItem 
                    key="blue"
                    onPress={() => handleThemeChange('blue')}
                    textValue="Azul"
                  >
                    🔵 Azul
                  </DropdownItem>
                  <DropdownItem 
                    key="green"
                    onPress={() => handleThemeChange('green')}
                    textValue="Verde"
                  >
                    🟢 Verde
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
