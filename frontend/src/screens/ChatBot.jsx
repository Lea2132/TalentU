import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hola! ¿En qué podemos ayudarte?', sender: "cliente" },
  ]);
  const nextIdRef = useRef(2);
  const [showOptions, setShowOptions] = useState(true);
  const [conversationStep, setConversationStep] = useState(0);
  const { register, handleSubmit, reset, setValue } = useForm();

  const options = [
    "Peticiones",
    "Quejas",
    "Reclamos",
    "Sugerencias",
  ];

  const getAutoReply = () => {
    const steps = [
      "¿Cuál es tu nombre?",
      "¿Cuál es tu número de documento sin puntos ni espacios?",
      "Por favor, describe tu problema o consulta.",
      "Danos por favor un número de teléfono de contacto.",
      "Gracias por la información. Pronto te contactaremos para brindarte ayuda.",
    ];
    return steps[conversationStep] || steps[steps.length - 1];
  };

  const onSubmit = handleSubmit(async (data) => {
    const { text } = data;
    if (text.trim() === "") return;

    const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    if (!userData) {
      console.warn('Usuario no autenticado para chatbot');
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
    setShowOptions(false);

    try {
      const response = await axios.post(`${API_URL}/chatbot`, {
        text, 
        sender: 'yo', 
        user_id: userData.id 
      });
      console.log("Server response:", response.data);

      const botReplyId = nextIdRef.current++;
      setTimeout(() => {
        const botReply = {
          id: botReplyId,
          text: getAutoReply(),
          sender: "cliente",
        };
        setMessages((prevMessages) => [...prevMessages, botReply]);
        if (conversationStep < 4) {
          setConversationStep(conversationStep + 1);
        }
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  const handleOptionClick = (option) => {
    setValue("text", option);
    onSubmit();
  };

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

        {showOptions && (
          <div className="flex flex-col items-start mt-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition duration-200"
              >
                {option}
              </button>
            ))}
          </div>
        )}
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

export default ChatBot;
