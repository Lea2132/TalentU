/* eslint-disable react/prop-types */
import { Edit, Trash, PlusCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';

const ProductCard = ({ product, handleEdit, handleDelete, handlePublish }) => {
  const imageUrl = `http://localhost:3000/${product.image_url.replace(/\\/g, '/')}`;
  const [isPublished, setIsPublished] = useState(product.is_published || false);
  const [loading, setLoading] = useState(false);

  const handleTogglePublish = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const newStatus = !isPublished;
      
      const response = await fetch(`http://localhost:3000/api/products/${product.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ is_published: newStatus })
      });

      if (response.ok) {
        setIsPublished(newStatus);
        Swal.fire({
          title: '¡Éxito!',
          text: newStatus ? 'Producto publicado correctamente' : 'Publicación removida',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: 'var(--color-primary)'
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error("Error al cambiar estado de publicación:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar el estado de publicación',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: 'var(--color-primary)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-200 shadow-md rounded p-4">
      {product.image_url && (
        <img
          src={imageUrl} 
          alt={product.title}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-lg font-bold text-blue-700">{product.title}</h3>
      <p className="text-blue-600">{product.description}</p>
      <p className="text-blue-800 font-bold">${product.price}</p>
      <p className="text-blue-500">{product.category}</p>
      <p className={`text-sm font-semibold mb-2 ${isPublished ? 'text-green-600' : 'text-gray-600'}`}>
        {isPublished ? '✓ Publicado' : '○ No publicado'}
      </p>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => handleEdit(product)}
          className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center"
        >
          <Edit className="w-4 h-4 mr-1" /> Editar
        </button>
        <button
          onClick={() => handleDelete(product.id)}
          className="bg-red-500 text-white px-3 py-1 rounded flex items-center"
        >
          <Trash className="w-4 h-4 mr-1" /> Eliminar
        </button>
        <button
          onClick={handleTogglePublish}
          disabled={loading}
          className={`text-white px-3 py-1 rounded flex items-center ${isPublished ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPublished ? (
            <>
              <XCircle className="w-4 h-4 mr-1" /> Quitar Publicación
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-1" /> Publicar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
