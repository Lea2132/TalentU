/* eslint-disable react/prop-types */
import { useEffect } from "react";
import Modal from "./Modal"; 
import { useForm } from "react-hook-form";
import axios from "axios";

const EditProductForm = ({ editingProduct, handleUpdate, setEditingProduct }) => {
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (editingProduct) {
      setValue("title", editingProduct.title);
      setValue("description", editingProduct.description);
      setValue("price", editingProduct.price);
      setValue("category", editingProduct.category);
    }
  }, [editingProduct, setValue]);

  const onSubmit = async (data) => {
    const updatedProduct = { ...editingProduct, ...data };

   
    const formData = new FormData();
    formData.append("title", updatedProduct.title);
    formData.append("description", updatedProduct.description);
    formData.append("price", updatedProduct.price);
    formData.append("category", updatedProduct.category);


    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/products/${editingProduct.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      handleUpdate(response.data);
      setEditingProduct(null); 
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  };

  return (
    <div>
      {editingProduct && (
        <Modal isOpen={true} onClose={() => setEditingProduct(null)} title="Editar Producto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-blue-700">Titulo</label>
              <input
                id="title"
                type="text"
                className="border border-blue-400 p-2 w-full rounded"
                {...register("title", { required: true })}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-blue-700">Descripcion</label>
              <textarea
                id="description"
                className="border border-blue-400 p-2 w-full rounded"
                {...register("description", { required: true })}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="price" className="block text-blue-700">Precio</label>
              <input
                id="price"
                type="number"
                className="border border-blue-400 p-2 w-full rounded"
                {...register("price", { required: true })}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="block text-blue-700">Categoria</label>
              <select
                id="category"
                className="border border-blue-400 p-2 w-full rounded"
                {...register("category", { required: true })}
              >
                <option value="Producto">Producto</option>
                <option value="Comida">Comida</option>
                <option value="Servicio">Servicio</option>
              </select>
            </div>
           
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Actualizar Producto
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EditProductForm;
