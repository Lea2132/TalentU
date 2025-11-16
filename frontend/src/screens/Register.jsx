import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  MdVisibility,
  MdVisibilityOff,
  MdOutlinePassword,
  MdOutlineEmail,
} from "react-icons/md";
import { useState } from "react";

const Register = () => {
  const redirect = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", data);
      console.log(res.data);
      reset();
      Swal.fire({
        title: 'Operación exitosa!',
        text: 'Creación de cuenta con éxito',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb'
      })
      redirect("/");
    } catch (error) {
      console.log("Error", error);
    }
  });

  const errorMessages = Object.values(errors).map((error) => error.message);

  return (
    <section
      className="min-h-screen bg-blue-500 flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/img/a1.png)` }}
    >
      <div className="flex flex-col md:flex-row w-full max-w-4xl space-y-6 md:space-y-0">
        {/* Conatiner de registro */}
        <div className="form-container">
          <h1 className="title">Registro</h1>
          <form onSubmit={onSubmit} className="flex flex-col space-y-4">
            <div className="input-container">
              <FaRegUserCircle className="text-blue-600 mr-2" />
              <input
                {...register("name", {
                  required: "Nombre requerido",
                  minLength: {
                    value: 2,
                    message: "El nombre debe contener al menos 2 caracteres",
                  },
                  maxLength: 20,
                })}
                placeholder="Nombre"
                className="inputs-register"
              />
            </div>

            <div className="input-container">
              <MdOutlineEmail className="text-blue-600 mr-2" />
              <input
                type="email"
                {...register("email", {
                  required: "Email requerido",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                    message: "Email invalido",
                  },
                })}
                placeholder="Email"
                className="inputs-register"
              />
            </div>

            <div className="input-container relative">
              <MdOutlinePassword className="text-blue-600 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Contraseña requerida",
                  minLength: {
                    value: 6,
                    message:
                      "La contraseña debe contener al menos 6 caracteres",
                  },
                })}
                placeholder="Contraseña"
                className="inputs-register"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-2 text-blue-600"
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>

            {errorMessages.length > 0 && (
              <div className="text-red-600 font-bold rounded-lg p-2">
                {errorMessages.map((msg, index) => (
                  <p key={index} className="text-sm">
                    {msg}
                  </p>
                ))}
              </div>
            )}

            <button className="register-button">Registrar</button>
          </form>
          <p className="link">
            ¿Ya tienes una cuenta?{"   "}
            <Link
              to="/"
              className="text-blue-800 text-base hover:text-blue-700 transition-colors duration-300 ease-in-out relative group font-bold"
            >
             Inicia Sesion
               <span className="absolute left-0 bottom-0 w-0.5 h-0.5 bg-blue-900 transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </Link>
          </p>
        </div>

        {/* Contenedor por qe registrarse */}
        <div className="why-register-container">
          <div>
            <h2 className="why-title">¿Por que registrarse?</h2>
            <p className="why-text">
            El registro en la plataforma es un paso esencial para garantizar 
            que tanto los que ofrecen el servicio y los que lo adquieren sean miembros verificados 
            de la comunidad universitaria. Al requerir un proceso de registro, 
            podemos asegurar que todos los emprendedores que suben sus servicios
            y los consumidores que los adquieren forman parte de 
            la misma institución educativa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
