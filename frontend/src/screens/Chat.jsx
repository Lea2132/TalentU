import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  Package,
  Send,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { API_URL, apiAssetUrl } from '../config/api';

const POLL_INTERVAL = 5000;

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem('token');
  const isGuest = localStorage.getItem('guest') === 'true';
  const storedUser = localStorage.getItem('userData');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = Number(currentUser?.id);
  const productId = Number(searchParams.get('productId')) || null;
  const queryConversationId = Number(searchParams.get('conversationId')) || null;
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(queryConversationId);
  const [product, setProduct] = useState(location.state?.product || null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const authConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const refreshConversations = useCallback(async () => {
    if (!token || isGuest) {
      setLoadingConversations(false);
      return [];
    }

    const response = await axios.get(`${API_URL}/conversations`, authConfig);
    setConversations(response.data);
    return response.data;
  }, [authConfig, isGuest, token]);

  useEffect(() => {
    let active = true;
    if (!token || isGuest) {
      setLoadingConversations(false);
      return () => {
        active = false;
      };
    }

    const loadConversations = async () => {
      setLoadingConversations(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/conversations`, authConfig);
        if (active) setConversations(response.data);
      } catch (requestError) {
        console.error('Error al cargar conversaciones:', requestError);
        if (active) setError('No se pudieron cargar tus conversaciones. Intenta de nuevo.');
      } finally {
        if (active) setLoadingConversations(false);
      }
    };

    loadConversations();
    const intervalId = window.setInterval(() => {
      axios.get(`${API_URL}/conversations`, authConfig)
        .then((response) => {
          if (active) setConversations(response.data);
        })
        .catch((requestError) => {
          console.error('Error al actualizar conversaciones:', requestError);
        });
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [authConfig, isGuest, token]);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }
    if (product?.id === productId) return;

    let active = true;
    const loadProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/allproducts`, authConfig);
        const found = response.data.find((entry) => Number(entry.id) === productId);
        if (!active) return;
        if (found) {
          setProduct({
            id: found.id,
            title: found.title,
            category: found.category,
            image_url: found.image_url,
            seller_name: found.seller_name,
          });
        } else {
          setError('No encontramos la publicación seleccionada.');
        }
      } catch (requestError) {
        console.error('Error al cargar la publicación del chat:', requestError);
        if (active) setError('No se pudo cargar la publicación. Intenta de nuevo.');
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [authConfig, product, productId]);

  useEffect(() => {
    if (!queryConversationId || !conversations.length) return;
    const matchingConversation = conversations.find(
      (conversation) => Number(conversation.id) === queryConversationId
    );
    if (matchingConversation) setSelectedConversationId(matchingConversation.id);
  }, [conversations, queryConversationId]);

  useEffect(() => {
    if (!productId || !conversations.length) return;
    const existingConversation = conversations.find(
      (conversation) => Number(conversation.product_id) === productId
    );
    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      setProduct(null);
      setSearchParams({ conversationId: String(existingConversation.id) }, { replace: true });
    }
  }, [conversations, productId, setSearchParams]);

  const selectedConversation = conversations.find(
    (conversation) => Number(conversation.id) === Number(selectedConversationId)
  ) || null;
  const activeProduct = selectedConversation || product;
  const showThreadOnMobile = Boolean(selectedConversation || product);

  const loadMessages = useCallback(async (conversationId, active = true) => {
    if (!token || !conversationId) return;
    try {
      const response = await axios.get(
        `${API_URL}/conversations/${conversationId}/messages`,
        authConfig
      );
      if (active) {
        setMessages((current) => {
          const unchanged = current.length === response.data.length
            && current.every((message, index) => Number(message.id) === Number(response.data[index].id));
          return unchanged ? current : response.data;
        });
      }
    } catch (requestError) {
      console.error('Error al cargar mensajes:', requestError);
      if (active) setError('No se pudieron cargar los mensajes de esta conversación.');
    }
  }, [authConfig, token]);

  useEffect(() => {
    if (!selectedConversationId || !token || isGuest) {
      setMessages([]);
      return undefined;
    }

    let active = true;
    setLoadingMessages(true);
    setError('');
    loadMessages(selectedConversationId, active)
      .finally(() => {
        if (active) setLoadingMessages(false);
      });
    const intervalId = window.setInterval(
      () => loadMessages(selectedConversationId, active),
      POLL_INTERVAL
    );

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isGuest, loadMessages, selectedConversationId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conversation) => {
    setSelectedConversationId(conversation.id);
    setProduct(null);
    setSearchParams({ conversationId: String(conversation.id) });
  };

  const handleBackToInbox = () => {
    setSelectedConversationId(null);
    setProduct(null);
    setSearchParams({});
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = messageText.trim();
    if (!text || text.length > 2000 || sending) return;

    setSending(true);
    setError('');
    try {
      if (selectedConversation) {
        const response = await axios.post(
          `${API_URL}/conversations/${selectedConversation.id}/messages`,
          { text },
          authConfig
        );
        setMessages((current) => [...current, response.data]);
        refreshConversations().catch((requestError) => {
          console.error('El mensaje se envió, pero no se pudo actualizar la bandeja:', requestError);
        });
      } else if (product) {
        const response = await axios.post(
          `${API_URL}/conversations`,
          { product_id: product.id, text },
          authConfig
        );
        setConversations((current) => [
          {
            ...response.data.conversation,
            last_message: response.data.message.text,
            last_sender_id: response.data.message.sender_id,
            last_message_at: response.data.message.created_at,
            unread_count: 0,
          },
          ...current.filter((conversation) => conversation.id !== response.data.conversation.id),
        ]);
        setSelectedConversationId(response.data.conversation.id);
        setSearchParams({ conversationId: String(response.data.conversation.id) }, { replace: true });
        setMessages([response.data.message]);
      }
      setMessageText('');
    } catch (requestError) {
      console.error('Error al enviar mensaje:', requestError);
      setError(requestError.response?.data?.message || 'No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (!token || isGuest) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="mx-auto mt-12 max-w-xl rounded-2xl bg-white p-8 text-center shadow">
          <MessageCircle className="mx-auto mb-4 h-10 w-10 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">Inicia sesión para usar Mensajes</h1>
          <p className="mt-2 text-slate-600">Con tu cuenta puedes contactar directamente a quien ofrece cada publicación.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Ir a iniciar sesión
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
        <header className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Conecta con la comunidad</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Mensajes</h1>
          <p className="mt-1 text-slate-600">Habla directamente con la persona que ofrece la publicación.</p>
        </header>

        {error && (
          <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" className="font-semibold underline" onClick={() => setError('')}>
              Cerrar
            </button>
          </div>
        )}

        <section className="grid min-h-[65vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className={`${showThreadOnMobile ? 'hidden md:block' : 'block'} border-r border-slate-200`}>
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="font-bold text-slate-800">Tus conversaciones</h2>
            </div>
            {loadingConversations ? (
              <p className="p-5 text-sm text-slate-500">Cargando conversaciones...</p>
            ) : conversations.length ? (
              <ul className="divide-y divide-slate-100">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => selectConversation(conversation)}
                      className={`w-full px-4 py-4 text-left transition hover:bg-blue-50 ${
                        Number(selectedConversationId) === Number(conversation.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <UserRound className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{conversation.other_user_name}</p>
                            <p className="truncate text-xs text-slate-500">{conversation.product_title}</p>
                          </div>
                        </div>
                        {Number(conversation.unread_count) > 0 && (
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate pl-[52px] text-sm text-slate-500">
                        {conversation.last_message || 'Inicia la conversación'}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="font-medium text-slate-700">Aún no tienes conversaciones</p>
                <p className="mt-1 text-sm text-slate-500">Contacta a alguien desde una publicación para empezar.</p>
              </div>
            )}
          </aside>

          <div className={`${showThreadOnMobile ? 'flex' : 'hidden md:flex'} min-w-0 flex-col`}>
            {activeProduct ? (
              <>
                <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={handleBackToInbox}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                    aria-label="Volver a conversaciones"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-blue-700">
                    {activeProduct.image_url ? (
                      <img
                        src={apiAssetUrl(activeProduct.image_url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-slate-900">
                      {activeProduct.product_title || activeProduct.title}
                    </h2>
                    <p className="truncate text-sm text-slate-500">
                      {selectedConversation?.other_user_name || activeProduct.seller_name || 'Vendedor'}
                    </p>
                  </div>
                  <ShoppingBag className="ml-auto hidden h-5 w-5 text-slate-400 sm:block" />
                </header>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                  {loadingMessages && !messages.length && (
                    <p className="text-center text-sm text-slate-500">Cargando mensajes...</p>
                  )}
                  {!selectedConversation && product && (
                    <div className="mx-auto max-w-md rounded-xl border border-blue-100 bg-white px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
                      Este chat será directamente con quien ofrece <strong>{product.title}</strong>. Envía un mensaje para iniciar.
                    </div>
                  )}
                  {messages.map((message) => {
                    const isMine = Number(message.sender_id) === currentUserId;
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                          isMine ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-slate-800'
                        }`}>
                          {!isMine && (
                            <p className="mb-1 text-xs font-semibold text-blue-700">{message.sender_name}</p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>
                          <time className={`mt-1 block text-right text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                            {formatTime(message.created_at)}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 sm:p-4">
                  <label className="sr-only" htmlFor="chat-message">Escribe un mensaje</label>
                  <textarea
                    id="chat-message"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form.requestSubmit();
                      }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder="Escribe un mensaje..."
                    className="max-h-32 min-h-11 min-w-0 flex-1 resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">{sending ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="hidden flex-1 flex-col items-center justify-center px-6 text-center md:flex">
                <MessageCircle className="mb-4 h-12 w-12 text-blue-200" />
                <h2 className="text-xl font-semibold text-slate-800">Selecciona una conversación</h2>
                <p className="mt-2 max-w-sm text-slate-500">Tus mensajes con compradores y vendedores aparecerán aquí.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Chat;
