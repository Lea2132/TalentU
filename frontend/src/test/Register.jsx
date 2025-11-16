/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
import Register from "./Register"; 
import axios from "axios"; 
import MockAdapter from "axios-mock-adapter"; 

// Se crea una instancia de MockAdapter para interceptar las solicitudes de axios
const mockAxios = new MockAdapter(axios); 

describe("Register Component", () => {
  // Se reinicia la configuracion del mock despues de cada prueba
  afterEach(() => {
    mockAxios.reset(); 
  });

  // Prueba para verificar que el formulario de registro se renderiza correctamente
  test("renders registration form", () => {
    render(<Register />); // Renderiza el componente Register
    expect(screen.getByText(/registro/i)).toBeInTheDocument(); // Verifica que el texto "registro" este en el documento
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument(); // Verifica que el campo de nombre este presente
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument(); // Verifica que el campo de email este presente
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument(); // Verifica que el campo de contraseña este presente
    expect(screen.getByText(/registrar/i)).toBeInTheDocument(); // Verifica que el boton de registrar este presente
  });

  // Prueba para mostrar mensajes de error para entradas invalidas
  test("shows error messages for invalid input", async () => {
    render(<Register />); // Renderiza el componente Register

    // Simula la entrada de datos invalidos en el campo de nombre
    fireEvent.input(screen.getByPlaceholderText(/nombre/i), {
      target: { value: "" }, // Deja el campo vacio
    });
    // Simula la entrada de un email invalido
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "invalidEmail" }, // Introduce un email no valido
    });
    // Simula la entrada de una contraseña corta
    fireEvent.input(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: "123" }, // Introduce una contraseña que no cumple con los requisitos
    });

    // Simula el envio del formulario
    fireEvent.submit(screen.getByRole("button", { name: /registrar/i }));

    // Espera que los mensajes de error aparezcan en el documento
    await waitFor(() => {
      expect(screen.getByText(/nombre requerido/i)).toBeInTheDocument(); // Verifica que el mensaje de nombre requerido este presente
      expect(screen.getByText(/email invalido/i)).toBeInTheDocument(); // Verifica que el mensaje de email invalido este presente
      expect(screen.getByText(/la contraseña debe contener al menos 6 caracteres/i)).toBeInTheDocument(); // Verifica que el mensaje de contraseña invalida este presente
    });
  });

  // Prueba para verificar que el formulario se envia con entradas validas
  test("submits form with valid input", async () => {
    // Simula una respuesta exitosa para la solicitud de registro
    mockAxios.onPost("http://localhost:3000/api/register").reply(200, { message: "User registered" });

    render(<Register />); // Renderiza el componente Register

    // Simula la entrada de un nombre valido
    fireEvent.input(screen.getByPlaceholderText(/nombre/i), {
      target: { value: "John Doe" }, // Introduce un nombre valido
    });
    // Simula la entrada de un email valido
    fireEvent.input(screen.getByPlaceholderText(/email/i), {
      target: { value: "john@example.com" }, // Introduce un email valido
    });
    // Simula la entrada de una contraseña valida
    fireEvent.input(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: "securepassword" }, // Introduce una contraseña segura
    });

    // Simula el envio del formulario
    fireEvent.submit(screen.getByRole("button", { name: /registrar/i }));

    // Espera que no aparezcan mensajes de error y que se muestre el mensaje de exito
    await waitFor(() => {
      expect(screen.queryByText(/nombre requerido/i)).not.toBeInTheDocument(); // Verifica que el mensaje de nombre requerido no este presente
      expect(screen.queryByText(/email invalido/i)).not.toBeInTheDocument(); // Verifica que el mensaje de email invalido no este presente
      expect(screen.queryByText(/la contraseña debe contener al menos 6 caracteres/i)).not.toBeInTheDocument(); // Verifica que el mensaje de contraseña invalida no este presente
      expect(screen.getByText(/usuario registrado/i)).toBeInTheDocument(); // Verifica que el mensaje de usuario registrado este presente
    });
  });
});
