/* eslint-disable react/prop-types */
import { useState } from "react";
import Modal from "./Modal"; 
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

const CreateProductForm = ({ handleCreateProduct }) => {
  const { register, handleSubmit,reset, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("image", data.image[0]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post("http://localhost:3000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      handleCreateProduct(response.data);
      closeModal();
      reset();
    } catch (error) {
      console.error("Error al crear el producto:", error);
    }
  };

  return (
    <div className="justify-center">
      <button onClick={openModal} className="buttons-profile">
        <Plus className="h-5 w-5 mr-2" /> Crear Producto
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Crear Nuevo Producto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-blue-700">Titulo</label>
            <input id="title" type="text" placeholder="Titulo del producto" className="border border-blue-400 p-2 w-full rounded" {...register("title", { required: true })} />
            {errors.title && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-blue-700">Descripcion</label>
            <textarea id="description" placeholder="Descripcion del producto" className="border border-blue-400 p-2 w-full rounded" {...register("description", { required: true })} />
            {errors.description && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-blue-700">Precio</label>
            <input id="price" type="number" placeholder="Precio" className="border border-blue-400 p-2 w-full rounded" {...register("price", { required: true })} />
            {errors.price && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-blue-700">Categoria</label>
            <select id="category" className="border border-blue-400 p-2 w-full rounded" {...register("category", { required: true })}>
              <option value="">Selecciona una categoria</option>
              <option value="Producto">Producto</option>
              <option value="Comida">Comida</option>
              <option value="Servicio">Servicio</option>
            </select>
            {errors.category && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-blue-700">Imagen del Producto</label>
            <input id="image" type="file" accept="image/*" className="border border-blue-400 p-2 w-full rounded" {...register("image", { required: true })} />
            {errors.image && <span className="text-red-500">Este campo es obligatorio</span>}
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Crear Producto</button>
        </form>
      </Modal>
    </div>
  );
};

export default CreateProductForm;
