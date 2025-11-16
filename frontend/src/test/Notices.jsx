/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // Añade matchers como `toBeInTheDocument`
import Notices from '../components/Notices'; // Ajusta la ruta según la ubicación de tu componente
import { noticias } from '../constants/const'; // Ajusta la ruta de las noticias

// Mock de datos para la prueba
jest.mock('../constants/const', () => ({
  noticias: [
    {
      id: 1,
      titulo: 'Noticia 1',
      descripcion: 'Descripción de la noticia 1',
      imagen: 'https://example.com/noticia1.jpg',
    },
    {
      id: 2,
      titulo: 'Noticia 2',
      descripcion: 'Descripción de la noticia 2',
      imagen: 'https://example.com/noticia2.jpg',
    },
  ],
}));

describe('Notices Component', () => {
  // Verifica que se renderice correctamente el encabezado
  test('debe mostrar el título de la página', () => {
    render(<Notices />);
    const titleElement = screen.getByText(/Noticias Tecnologico De Antioquia \(TDEA\)/i);
    expect(titleElement).toBeInTheDocument();
  });

  // Verifica que las noticias se rendericen
  test('debe mostrar todas las noticias con su título y descripción', () => {
    render(<Notices />);
    noticias.forEach((noticia) => {
      expect(screen.getByText(noticia.titulo)).toBeInTheDocument();
      expect(screen.getByText(noticia.descripcion)).toBeInTheDocument();
    });
  });

  // Verifica que los botones "Leer más" se rendericen
  test('debe mostrar los botones de "Leer más" en cada noticia', () => {
    render(<Notices />);
    const buttons = screen.getAllByText(/Leer más/i);
    expect(buttons.length).toBe(noticias.length);
  });

  // Verifica que las imágenes de las noticias se rendericen correctamente
  test('debe mostrar las imágenes de las noticias', () => {
    render(<Notices />);
    noticias.forEach((noticia) => {
      const img = screen.getByAltText(noticia.titulo);
      expect(img).toBeInTheDocument();
      expect(img.src).toBe(noticia.imagen);
    });
  });
});
