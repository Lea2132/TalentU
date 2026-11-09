/* eslint-disable react/prop-types */
import { Edit, Trash, PlusCircle, XCircle, ImageOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';

const ProductCard = ({ product, handleEdit, handleDelete, onPublishChange }) => {
  const imageUrl = product.image_url
    ? `http://localhost:3000/${product.image_url.replace(/\\/g, '/')}`
    : null;
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
        onPublishChange(product.id, newStatus);
        Swal.fire({
          title: '¡Éxito!',
          text: newStatus ? 'Servicio publicado correctamente' : 'Publicación removida',
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
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-8 w-8" />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
            isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-white/95 text-slate-600'
          }`}
        >
          {isPublished ? 'Publicado' : 'Borrador'}
        </span>
        <span
          className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          {product.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-slate-900">{product.title}</h3>
        <p className="mt-2 min-h-10 line-clamp-2 text-sm leading-5 text-slate-600">{product.description}</p>
        <p className="mt-4 text-xl font-black" style={{ color: 'var(--color-primary)' }}>
          {new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          }).format(Number(product.price) || 0)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50 p-4">
        <button
          type="button"
          onClick={() => handleEdit(product)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          <Edit className="mr-2 h-4 w-4" /> Editar
        </button>
        <button
          type="button"
          onClick={() => handleDelete(product.id)}
          className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          <Trash className="mr-2 h-4 w-4" /> Eliminar
        </button>
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={loading}
          className="col-span-2 inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: isPublished ? '#64748b' : 'var(--color-primary)' }}
        >
          {isPublished ? (
            <>
              <XCircle className="mr-2 h-4 w-4" /> Quitar publicación
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> Publicar servicio
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
