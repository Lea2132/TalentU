/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Heart, MessageCircle, Send, Star } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';

const ItemCard = ({ item, isGuest }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentsCount, setCommentsCount] = useState(item.comments);
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(item.userLiked);
  const [rating, setRating] = useState(item.rating);
  const [ratingCount, setRatingCount] = useState(item.ratingsCount);
  const [userRating, setUserRating] = useState(item.userRating);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [updatingLike, setUpdatingLike] = useState(false);

  const token = localStorage.getItem('token');
  const canInteract = !isGuest && Boolean(token);
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  let currentUserId = null;
  try {
    currentUserId = JSON.parse(localStorage.getItem('userData') || 'null')?.id ?? null;
  } catch (error) {
    console.error('No se pudieron leer los datos del usuario:', error);
  }
  const isOwner = currentUserId !== null && Number(currentUserId) === Number(item.user_id);

  const toggleComments = async () => {
    const opening = !showComments;
    setShowComments(opening);
    if (!opening) return;

    setLoadingComments(true);
    try {
      const response = await axios.get(`${API_URL}/products/${item.id}/comments`);
      setComments(response.data);
      setCommentsCount(response.data.length);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      Swal.fire('Error', 'No se pudieron cargar los comentarios.', 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!canInteract || updatingLike) return;
    setUpdatingLike(true);
    try {
      const nextLiked = !liked;
      const response = await axios.put(
        `${API_URL}/products/${item.id}/like`,
        { liked: nextLiked },
        { headers: authHeaders }
      );
      setLiked(response.data.liked);
      setLikes(response.data.likes_count);
    } catch (error) {
      console.error('Error al actualizar el like:', error);
      Swal.fire('Error', 'No se pudo actualizar el me gusta.', 'error');
    } finally {
      setUpdatingLike(false);
    }
  };

  const handleRating = async (value) => {
    if (!canInteract || savingRating) return;
    setSavingRating(true);
    try {
      const response = await axios.put(
        `${API_URL}/products/${item.id}/rating`,
        { rating: value },
        { headers: authHeaders }
      );
      setRating(Number(response.data.rating_avg) || 0);
      setRatingCount(Number(response.data.ratings_count) || 0);
      setUserRating(response.data.rating);
    } catch (error) {
      console.error('Error al guardar la calificación:', error);
      Swal.fire('Error', 'No se pudo guardar tu calificación.', 'error');
    } finally {
      setSavingRating(false);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const content = commentText.trim();
    if (!canInteract || !content || sendingComment) return;

    setSendingComment(true);
    try {
      const response = await axios.post(
        `${API_URL}/products/${item.id}/comments`,
        { text: content },
        { headers: authHeaders }
      );
      setComments((current) => [response.data, ...current]);
      setCommentsCount((count) => count + 1);
      setCommentText('');
    } catch (error) {
      console.error('Error al publicar el comentario:', error);
      Swal.fire('Error', 'No se pudo publicar el comentario.', 'error');
    } finally {
      setSendingComment(false);
    }
  };

  const handleContactSeller = () => {
    if (!canInteract) {
      Swal.fire({
        title: 'Inicia sesión para contactar',
        text: 'Necesitas una cuenta para conversar con quien ofrece esta publicación.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Ahora no',
        confirmButtonColor: 'var(--color-primary)',
      }).then((result) => {
        if (result.isConfirmed) navigate('/');
      });
      return;
    }

    if (isOwner) return;
    navigate(`/chat?productId=${item.id}`, {
      state: {
        product: {
          id: item.id,
          title: item.name,
          category: item.category,
          image_url: item.image,
          seller_name: item.seller_name,
        },
      },
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full mb-2">
          {item.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-2">{item.description}</p>
        <p className="text-blue-600 font-bold mb-2">{item.price}</p>

        <div className="flex items-center gap-1" aria-label={`Calificación promedio: ${rating.toFixed(1)} de 5`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRating(value)}
              disabled={!canInteract || savingRating}
              aria-label={`Calificar con ${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
              title={canInteract ? `Calificar con ${value} estrellas` : 'Inicia sesión para calificar'}
              className={`disabled:cursor-not-allowed ${canInteract ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <Star
                className={`w-5 h-5 ${value <= (userRating || Math.round(rating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
          <span className="ml-1 text-sm text-gray-600">
            {rating.toFixed(1)} ({ratingCount})
          </span>
        </div>
        {canInteract && (
          <p className="text-xs text-gray-500 mt-1">
            {userRating ? `Tu calificación: ${userRating} de 5. Puedes cambiarla.` : 'Selecciona estrellas para calificar.'}
          </p>
        )}
      </div>

      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <button
          type="button"
          className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={toggleComments}
          aria-expanded={showComments}
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{commentsCount}</span>
          <span className="sr-only"> comentarios</span>
        </button>
        <button
          type="button"
          className={`flex items-center ${liked ? 'text-red-600' : 'text-gray-600'} hover:text-red-600 focus:outline-none disabled:opacity-50`}
          onClick={handleLike}
          disabled={!canInteract || updatingLike}
          aria-pressed={liked}
          title={canInteract ? (liked ? 'Quitar me gusta' : 'Me gusta') : 'Inicia sesión para dar me gusta'}
        >
          <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleContactSeller}
          disabled={isOwner}
          aria-label={isOwner ? 'Esta es tu publicación' : `Contactar al vendedor de ${item.name}`}
          title={isOwner ? 'Esta es tu publicación' : 'Enviar mensaje al vendedor'}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{isOwner ? 'Tu publicación' : 'Contactar'}</span>
        </button>
      </div>

      {showComments && (
        <section className="p-4 bg-gray-100 text-gray-700" aria-label={`Comentarios de ${item.name}`}>
          <h4 className="font-semibold mb-3">Comentarios ({commentsCount})</h4>
          {canInteract ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
              <label className="sr-only" htmlFor={`comment-${item.id}`}>Escribe un comentario</label>
              <input
                id={`comment-${item.id}`}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={1000}
                placeholder="Escribe un comentario..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || sendingComment}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Publicar comentario</span>
              </button>
            </form>
          ) : (
            <p className="mb-4 text-sm">Inicia sesión para comentar, dar me gusta o calificar.</p>
          )}

          {loadingComments ? (
            <p className="text-sm text-gray-500">Cargando comentarios...</p>
          ) : comments.length ? (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded-lg bg-white p-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <strong>{comment.user_name}</strong>
                    <time className="shrink-0 text-gray-500" dateTime={comment.created_at}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Aún no hay comentarios. ¡Sé el primero!</p>
          )}
        </section>
      )}
    </article>
  );
};

export default ItemCard;
