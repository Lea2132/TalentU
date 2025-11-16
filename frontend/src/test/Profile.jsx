/* eslint-disable no-undef */
import { render, screen, fireEvent } from "@testing-library/react";
import Profile from "./Profile";

describe("Profile Component", () => {
  test("renders profile header", () => {
    render(<Profile />);
    const headerElement = screen.getByText(/productos/i); // Busca el texto 'productos'
    expect(headerElement).toBeInTheDocument(); // Verifica que el encabezado este en el documento
  });

  test("creates a new product", () => {
    render(<Profile />);
    const titleInput = screen.getByPlaceholderText(/titulo/i); // Busca el campo de entrada del titulo
    const descriptionInput = screen.getByPlaceholderText(/descripcion/i); // Busca el campo de entrada de la descripcion
    const priceInput = screen.getByPlaceholderText(/precio/i); // Busca el campo de entrada del precio
    const categoryInput = screen.getByPlaceholderText(/categoria/i); // Busca el campo de entrada de la categoria
    const imageInput = screen.getByLabelText(/imagen/i); // Busca el campo de entrada de la imagen
    const submitButton = screen.getByText(/crear/i); // Busca el boton de crear

    fireEvent.change(titleInput, { target: { value: "Producto 1" } }); // Cambia el valor del titulo
    fireEvent.change(descriptionInput, { target: { value: "Descripcion del producto" } }); // Cambia el valor de la descripcion
    fireEvent.change(priceInput, { target: { value: "10" } }); // Cambia el valor del precio
    fireEvent.change(categoryInput, { target: { value: "Categoria 1" } }); // Cambia el valor de la categoria
    fireEvent.change(imageInput, { target: { files: [new File(["dummy content"], "example.png")] } }); // Cambia la imagen

    fireEvent.click(submitButton); // Simula un clic en el boton de crear

    const productElement = screen.getByText(/producto 1/i); // Busca el texto del nuevo producto
    expect(productElement).toBeInTheDocument(); // Verifica que el nuevo producto este en el documento
  });

  // Otras pruebas pueden ser añadidas para editar, eliminar y filtrar productos
});
