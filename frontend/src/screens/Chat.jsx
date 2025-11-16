import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola deseo comprar el producto publicado ¿Cuanto cuesta?", sender: "cliente" },
  ]);
  const nextIdRef = useRef(2);
  
  const { register, handleSubmit, reset } = useForm();

  const getAutoReply = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("precio") || lowerCaseMessage.includes("costo") || lowerCaseMessage.includes("precios")) {
      return "Ohh me gustaria comprar tu producto ¿Haces envios?";
    } else if (lowerCaseMessage.includes("envio") || lowerCaseMessage.includes("envío")) {
      return "En este momento estoy cerca de la universidad";
    } else if (lowerCaseMessage.includes("pago") || lowerCaseMessage.includes("pagar")) {
      return "Voy a pagar por bancolombia";
    } else {
      return "Entendido aqui estare esperandote";
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const { text } = data;
    if (text.trim() === "") return;

    const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    if (!userData) {
      console.warn('Usuario no autenticado para chat');
      return;
    }

    const userMessageId = nextIdRef.current++;
    const userMessage = {
      id: userMessageId,
      text: text,
      sender: "yo",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    reset();

    try {
      const response = await axios.post("http://localhost:3000/api/chat", { 
        text, 
        sender: 'yo', 
        user_id: userData.id 
      });
      console.log("Server response:", response.data);

      const botReplyId = nextIdRef.current++;
      setTimeout(() => {
        const botReply = {
          id: botReplyId,
          text: getAutoReply(text),
          sender: "cliente",
        };
        setMessages((prevMessages) => [...prevMessages, botReply]);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center justify-between bg-blue-600 p-4 text-white shadow-md">
        <h1 className="text-lg font-bold">Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`my-2 ${message.sender === 'yo' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs ${message.sender === 'yo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex items-center p-2 border-t border-gray-300 bg-white shadow-md">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          {...register('text')}
          className="flex-1 p-2 border border-blue-500 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-500 transition duration-200">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
