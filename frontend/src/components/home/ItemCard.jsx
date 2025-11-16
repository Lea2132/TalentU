/* eslint-disable react/prop-types */
import { useState } from 'react';
import { MessageCircle, Heart, ShoppingCart } from 'lucide-react';
import StarRating from './StarRating';
import {  useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const redirect = useNavigate()

  const handleNavigation = (path) => {
    redirect(path)
  }

  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animated-down">
      <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full mb-2">
          {item.category}
        </span>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-2">{item.description}</p>
        <p className="text-blue-600 font-bold mb-2">{item.price}</p>
        <StarRating rating={item.rating} />
      </div>
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <button
          className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{item.comments}</span>
        </button>
        <button className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none">
          <Heart className="w-5 h-5 mr-1" />
          <span>{item.likes}</span>
        </button>
        <button
          className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={() => handleNavigation("/chat")} 
        >
          <ShoppingCart className="w-5 h-5 mr-1" />
        </button>
      </div>
      {showComments && (
        <div className="p-4 bg-gray-100 text-gray-700 rounded-b-lg">
          <p>Comentarios: {item.comments} </p>
          <p>Aca van los comentarios más recientes</p>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
