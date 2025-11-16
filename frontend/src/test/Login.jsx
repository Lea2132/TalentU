/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import axios from 'axios';

// Mockear axios y la funcion de navegacion
jest.mock('axios');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Componente Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Prueba para verificar que el formulario de inicio de sesion se renderiza correctamente
  test('renderiza el formulario de login correctamente', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    // Verificar que el titulo se renderiza correctamente
    expect(screen.getByText('Iniciar Sesion')).toBeInTheDocument();
    
    // Verificar los placeholders de los inputs
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contrasena')).toBeInTheDocument();
    
    // Verificar que el boton de login se renderiza
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  // Prueba para mostrar errores de validacion si los inputs estan vacios
  test('muestra errores de validacion si los inputs estan vacios', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Simular clic en el boton sin llenar los campos
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    // Verificar los mensajes de error de validacion
    expect(await screen.findByText('Email requerido')).toBeInTheDocument();
    expect(screen.getByText('Contrasena requerida')).toBeInTheDocument();
  });

  // Prueba para verificar que se puede mostrar y ocultar la contrasena
  test('alternar visibilidad de contrasena', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Contrasena');
    const toggleButton = screen.getByRole('button', { name: /mostrar/i });

    // La contrasena debe ser inicialmente oculta
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Simular clic en el boton para mostrar la contrasena
    fireEvent.click(toggleButton);

    // Verificar que la contrasena ahora es visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Simular clic para ocultarla de nuevo
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Prueba para verificar que el login exitoso redirige a la pagina principal
  test('login exitoso redirige a la pagina principal', async () => {
    axios.post.mockResolvedValue({ data: { token: '12345' } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Llenar los inputs con valores validos
    fireEvent.input(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByPlaceholderText('Contrasena'), {
      target: { value: 'password123' },
    });

    // Simular clic en el boton de login
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    // Verificar que la funcion de navegacion fue llamada con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  // Prueba para verificar que se muestra un mensaje de error en caso de login fallido
  test('muestra mensaje de error en login fallido', async () => {
    axios.post.mockRejectedValue({
      response: { data: 'Credenciales invalidas' },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Llenar los inputs con valores invalidos
    fireEvent.input(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.input(screen.getByPlaceholderText('Contrasena'), {
      target: { value: 'wrongpassword' },
    });

    // Simular clic en el boton de login
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));
    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText('Credenciales invalidas')).toBeInTheDocument();
  });
});
