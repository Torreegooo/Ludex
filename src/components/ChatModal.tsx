import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SAFE_MEETUP_POINTS } from '../data/mockData';
import { getPlatformConfig } from '../utils/platformStyles';
import {
  Lock,
  ShieldCheck,
  Send,
  MapPin,
  Calendar,
  Clock,
  Handshake,
  KeyRound,
  ChevronLeft,
  CheckCheck,
  AlertTriangle,
  Image as ImageIcon,
  Camera,
  Search,
  ArrowDown,
  ArrowUp,
  X,
  Maximize2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Trash2,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const QUICK_RESPONSES = [
  '👋 ¡Hola! ¿Sigue disponible para trato en mano?',
  '📍 ¿Qué estación de metro o punto seguro te viene mejor?',
  '📦 ¿El juego incluye la caja y el manual original?',
  '🎮 ¿Está probado y funcionando al 100%?',
  '🤝 Me interesa mucho. ¿Podríamos quedar hoy mismo?',
  '💶 Tengo el efectivo exacto preparado para el encuentro.'
];

const PRESET_PHOTO_SAMPLES = [
  {
    name: 'Cartucho / Disco',
    url: 'https://images.unsplash.com/photo-1612287233261-689e472251a3?auto=format&fit=crop&w=800&q=80',
    desc: 'Detalle de pines y cartucho'
  },
  {
    name: 'Caja y Portada',
    url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    desc: 'Estado exterior de la caja'
  },
  {
    name: 'Prueba en Consola',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    desc: 'Videojuego cargado en pantalla'
  },
  {
    name: 'Punto de Encuentro',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    desc: 'Foto del vestíbulo de la estación'
  }
];

export const ChatModal: React.FC = () => {
  const {
    activeConversation,
    setActiveConversation,
    conversations,
    messages,
    sendMessage,
    deleteMessage,
    clearConversationMessages,
    deleteConversation,
    acceptDealOffer,
    rejectDealOffer,
    currentUser,
    setIsAuthModalOpen,
    setAuthMode,
    setSelectedGameModal,
    createPurchaseRequest,
    setActiveTab,
    games,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [selectedSafePoint, setSelectedSafePoint] = useState(SAFE_MEETUP_POINTS[0].name);
  const [meetupDate, setMeetupDate] = useState('Hoy');
  const [meetupTime, setMeetupTime] = useState('18:00');
  const [showMobileList, setShowMobileList] = useState(false);

  // Search in chat
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Image Upload / Attachment state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick responses menu
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Options / Delete dropdown menu in header
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Modal confirmation for deletions
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'message' | 'clear' | 'conversation';
    messageId?: string;
  }>({ isOpen: false, type: 'message' });

  // Scroll detection state
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadWhileScrolled, setUnreadWhileScrolled] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Mensajes
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Inicia sesión o crea tu perfil en LUDEX para chatear directamente con compradores y vendedores.
          </p>
        </div>
        <button
          onClick={() => {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Iniciar Sesión para Chatear
        </button>
      </div>
    );
  }

  // Filter conversations for active user
  const userConversations = conversations.filter(
    c => c.buyerId === currentUser.id || c.sellerId === currentUser.id
  );

  const activeConv = (activeConversation && userConversations.some(c => c.id === activeConversation.id))
    ? activeConversation
    : (userConversations[0] || null);

  const convMessages = activeConv ? messages[activeConv.id] || [] : [];

  const otherUser = activeConv
    ? currentUser.id === activeConv.buyerId
      ? { id: activeConv.sellerId, name: activeConv.sellerName, avatar: activeConv.sellerAvatar, roleLabel: 'Vendedor' }
      : { id: activeConv.buyerId, name: activeConv.buyerName, avatar: activeConv.buyerAvatar, roleLabel: 'Comprador' }
    : null;

  // Associated game if available
  const associatedGame = activeConv ? games.find(g => g.id === activeConv.gameId) : null;
  const platformConfig = getPlatformConfig(associatedGame?.platform || 'Nintendo Switch 2');

  // Filtered messages based on search
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return convMessages;
    const q = searchQuery.toLowerCase();
    return convMessages.filter(
      m => (m.text || '').toLowerCase().includes(q) || (m.image && 'foto imagen'.includes(q))
    );
  }, [convMessages, searchQuery]);

  // Handle scroll detection inside chat container
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const scrolledUp = distanceFromBottom > 70;
    setIsScrolledUp(scrolledUp);

    if (!scrolledUp) {
      setUnreadWhileScrolled(0);
    }
  };

  // Scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    setIsScrolledUp(false);
    setUnreadWhileScrolled(0);
  };

  // Scroll to top of chat
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // On conversation switch: jump instantly to bottom once
  useEffect(() => {
    isInitialLoadRef.current = true;
    setIsScrolledUp(false);
    setUnreadWhileScrolled(0);
    setIsSearching(false);
    setSearchQuery('');
    setSelectedImage(null);
    setShowImagePicker(false);
    setShowQuickReplies(false);
    setShowOptionsMenu(false);

    const timeout = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
      isInitialLoadRef.current = false;
    }, 60);

    return () => clearTimeout(timeout);
  }, [activeConv?.id]);

  if (userConversations.length === 0 || !activeConv || !otherUser) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
          <MessageSquare className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Bandeja de Mensajes
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Aún no tienes ningún chat abierto. Elige cualquier videojuego en el catálogo y haz clic en "Chatear" para contactar con el vendedor.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('explore')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Explorar Catálogo
        </button>
      </div>
    );
  }

  // Handle image file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }
    setImageUploadError(null);

    const reader = new FileReader();
    reader.onload = ev => {
      if (typeof ev.target?.result === 'string') {
        setSelectedImage(ev.target.result);
        setShowImagePicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedImage) return;

    sendMessage(
      activeConv.id,
      inputMessage.trim(),
      undefined,
      undefined,
      selectedImage || undefined
    );

    setInputMessage('');
    setSelectedImage(null);
    setShowImagePicker(false);
    setShowQuickReplies(false);

    setTimeout(() => {
      scrollToBottom('smooth');
    }, 50);
  };

  const handleProposeMeetup = () => {
    const formattedProposal = `📍 Propuesta de Encuentro Seguro: ${selectedSafePoint} para ${meetupDate} a las ${meetupTime}. Recuerda que el pago se realizará en mano tras revisar el videojuego.`;
    sendMessage(activeConv.id, formattedProposal, undefined, {
      location: selectedSafePoint,
      date: meetupDate,
      time: meetupTime,
      status: 'propuesto',
    });
    setShowMeetupModal(false);
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  // SEND STRUCTURED VERIFICATION MESSAGE (NOT PLAIN TEXT) TO BUY THE GAME
  const handleQuickDealOffer = () => {
    if (!activeConv || !currentUser) return;

    sendMessage(
      activeConv.id,
      '', // text is empty, verification card handles UI
      {
        gameId: activeConv.gameId,
        gameTitle: activeConv.gameTitle,
        gameImage: activeConv.gameImage || associatedGame?.images?.[0] || 'https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80',
        offeredPrice: activeConv.gamePrice,
        platform: associatedGame?.platform || 'Nintendo Switch 2',
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        sellerId: otherUser.id,
        status: 'pendiente',
      }
    );

    setTimeout(() => scrollToBottom('smooth'), 60);
  };

  // Execution of deletion
  const executeDeleteAction = async () => {
    if (!activeConv) return;

    if (deleteConfirmation.type === 'message' && deleteConfirmation.messageId) {
      await deleteMessage(activeConv.id, deleteConfirmation.messageId);
    } else if (deleteConfirmation.type === 'clear') {
      await clearConversationMessages(activeConv.id);
    } else if (deleteConfirmation.type === 'conversation') {
      await deleteConversation(activeConv.id);
      setShowMobileList(true);
    }

    setDeleteConfirmation({ isOpen: false, type: 'message' });
    setShowOptionsMenu(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 h-[82vh] max-h-[850px] min-h-[520px] relative transition-all">
      
      {/* ------------------------------------------------------------- */}
      {/* Left Sidebar: Conversations List */}
      {/* ------------------------------------------------------------- */}
      <div className={`md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full min-h-0 overflow-hidden bg-zinc-50/80 dark:bg-zinc-950/60 ${
        showMobileList ? 'flex' : 'hidden md:flex'
      }`}>
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mensajes ({userConversations.length})</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Canal Seguro
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-zinc-200/60 dark:divide-zinc-800/60 overscroll-contain">
          {userConversations.map(conv => {
            const isSelected = activeConv.id === conv.id;
            const convContact = currentUser.id === conv.buyerId
              ? { name: conv.sellerName, avatar: conv.sellerAvatar }
              : { name: conv.buyerName, avatar: conv.buyerAvatar };

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setActiveConversation(conv);
                  setShowMobileList(false);
                }}
                className={`w-full p-3 text-left transition-all flex items-center gap-3 relative group ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800/90 border-l-4 border-emerald-500 shadow-sm'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={convContact.avatar}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700 shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {convContact.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                    <span>{conv.gameTitle}</span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-mono">{conv.gamePrice} €</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {conv.lastMessage || 'Conversación iniciada'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Right Column: Chat Main Area */}
      {/* ------------------------------------------------------------- */}
      <div className={`md:col-span-8 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-zinc-900 relative ${
        showMobileList ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Top Header Bar */}
        <div className="p-3 sm:px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowMobileList(true)}
              className="md:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Ver conversaciones"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <img
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  {otherUser.name}
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                  {otherUser.roleLabel}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="En línea" />
              </div>

              {/* Game reference with prominent console indicator */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${platformConfig.badgeBg} ${platformConfig.textColor} uppercase tracking-tight`}>
                  {platformConfig.shortName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (associatedGame) setSelectedGameModal(associatedGame);
                  }}
                  className="text-[10px] sm:text-[11px] text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 text-left truncate max-w-[140px] sm:max-w-md flex items-center gap-1 group transition-colors"
                >
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:underline">{activeConv.gameTitle}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">({activeConv.gamePrice} €)</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons (Subir, Buscar, Opciones / Borrar chat) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct button: Subir al inicio del chat */}
            <button
              type="button"
              onClick={scrollToTop}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1 text-xs font-bold active:scale-95 shadow-2xs"
              title="Subir al inicio del chat para leer mensajes antiguos"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Subir arriba</span>
            </button>

            {/* Toggle Search */}
            <button
              type="button"
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchQuery('');
              }}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                isSearching
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Buscar mensajes"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Options Menu (Vaciar chat / Eliminar conversación) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Opciones del chat"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({ isOpen: true, type: 'clear' });
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Vaciar mensajes del chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({ isOpen: true, type: 'conversation' });
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-semibold border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Eliminar conversación</span>
                  </button>
                </div>
              )}
            </div>

            {/* Canal Seguro Pill */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px]">Seguro</span>
            </div>
          </div>
        </div>

        {/* Search Bar when active */}
        {isSearching && (
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs shrink-0 animate-in slide-in-from-top-1">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar palabras en esta conversación..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none text-xs"
              autoFocus
            />
            {searchQuery && (
              <span className="text-[11px] text-zinc-500">
                {displayedMessages.length} resultado{displayedMessages.length === 1 ? '' : 's'}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Safety Notice & Quick Deal Bar */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="line-clamp-1 sm:line-clamp-none">
              <strong>Trato Presencial:</strong> Pago en efectivo o Bizum en mano tras inspeccionar el videojuego.
            </span>
          </div>

          {currentUser.id === activeConv.buyerId && (
            <button
              onClick={handleQuickDealOffer}
              className="shrink-0 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm uppercase tracking-tight active:scale-95 transition-all"
            >
              Pedir Trato
            </button>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Messages Thread */}
        {/* ----------------------------------------------------------- */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-zinc-50/60 dark:bg-zinc-950/40 relative select-text"
        >
          {/* Beginning of chat indicator */}
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Inicio de la conversación con {otherUser.name}</span>
            </div>
          </div>

          {displayedMessages.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">
              {searchQuery
                ? `No se han encontrado mensajes que coincidan con "${searchQuery}".`
                : 'No hay mensajes en este chat. Escribe un mensaje o solicita la compra para comenzar.'}
            </div>
          )}

          {displayedMessages.map(msg => {
            const isMine = msg.senderId === currentUser.id;
            const isSystem = msg.isSystemNotice;

            // 1. SYSTEM NOTICE
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2 group relative">
                  <div className="max-w-md text-center bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-[11px] text-zinc-500 dark:text-zinc-400 relative">
                    <span>{msg.text}</span>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation({ isOpen: true, type: 'message', messageId: msg.id })}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 ml-1 inline-flex transition-opacity align-middle"
                      title="Borrar aviso"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // 2. SPECIAL INTERACTIVE VERIFICATION CARD FOR PURCHASE REQUESTS
            if (msg.dealOffer) {
              const offer = msg.dealOffer;
              const isSeller = currentUser.id === activeConv.sellerId;
              const offerPlatform = getPlatformConfig(offer.platform || associatedGame?.platform || 'Nintendo Switch 2');

              return (
                <div key={msg.id} className="w-full flex justify-center my-3 group relative animate-in fade-in zoom-in-95">
                  <div className={`w-full max-w-md rounded-2xl p-4 shadow-xl border-2 transition-all ${
                    offer.status === 'aceptada'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-emerald-500/10'
                      : offer.status === 'rechazada'
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400'
                      : 'bg-white dark:bg-zinc-900 border-amber-500/80 shadow-amber-500/10'
                  }`}>
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          offer.status === 'aceptada'
                            ? 'bg-emerald-500 text-white'
                            : offer.status === 'rechazada'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-black'
                        }`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black tracking-wider uppercase text-zinc-900 dark:text-white">
                            SOLICITUD FORMAL DE COMPRA
                          </h4>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            Trato presencial seguro con pago en mano
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        offer.status === 'aceptada'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : offer.status === 'rechazada'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 animate-pulse'
                      }`}>
                        {offer.status === 'aceptada' && '✅ Trato Aceptado'}
                        {offer.status === 'rechazada' && '❌ Rechazado'}
                        {offer.status === 'pendiente' && '⏳ Pendiente de Aceptar'}
                      </span>
                    </div>

                    {/* Game Details & Console Banner */}
                    <div className="py-3 flex items-center gap-3">
                      {offer.gameImage && (
                        <img
                          src={offer.gameImage}
                          alt={offer.gameTitle}
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-sm"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {/* Prominent Console Badge */}
                        <div className="mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${offerPlatform.badgeBg} ${offerPlatform.textColor} uppercase tracking-wider shadow-xs`}>
                            {offerPlatform.iconSymbol} {offerPlatform.name}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">
                          {offer.gameTitle}
                        </h5>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {offer.offeredPrice} €
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            (Pago en efectivo/Bizum en mano)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Info / Action Buttons */}
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                      {offer.status === 'pendiente' && (
                        <>
                          {isSeller ? (
                            <div className="space-y-2">
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                                🔔 <strong>{offer.buyerName || 'El comprador'}</strong> solicita comprar este juego en persona.
                                <br />
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  Al aceptar el mensaje, el anuncio se borrará automáticamente del catálogo para reservarlo para este comprador.
                                </span>
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => acceptDealOffer(activeConv.id, msg.id)}
                                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                                >
                                  <CheckCheck className="w-4 h-4" />
                                  <span>Aceptar Trato y Borrar Anuncio</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectDealOffer(activeConv.id, msg.id)}
                                  className="py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-rose-500/20 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 active:scale-95 font-bold text-xs transition-colors"
                                >
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                              ⏳ <strong>Solicitud de verificación enviada al vendedor.</strong>
                              <p className="text-zinc-500 mt-1">
                                El vendedor debe pulsar en aceptar para formalizar la venta. En cuanto lo acepte, el anuncio se borrará del catálogo y os coordinaréis para la entrega.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {offer.status === 'aceptada' && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                          <p className="font-black flex items-center gap-1.5">
                            <CheckCheck className="w-4 h-4 text-emerald-500" />
                            ¡TRATO CONFIRMADO Y ANUNCIO RETIRADO DEL CATÁLOGO!
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-300 text-[10px]">
                            El videojuego ha sido reservado con éxito. Coordinad en el chat el punto de encuentro y la hora. El pago se realiza en mano tras examinar el videojuego.
                          </p>
                        </div>
                      )}

                      {offer.status === 'rechazada' && (
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                          ❌ Esta solicitud formal de compra fue rechazada. Podéis seguir negociando en el chat.
                        </div>
                      )}

                      {/* Footer time and delete message button */}
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                        <span>{msg.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmation({ isOpen: true, type: 'message', messageId: msg.id })}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity"
                          title="Borrar mensaje"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            }

            // 3. STANDARD USER MESSAGE
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group animate-in fade-in relative`}
              >
                <div className="relative group/msg flex items-end gap-1.5 max-w-[85%] sm:max-w-md">
                  {!isMine && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation({ isOpen: true, type: 'message', messageId: msg.id })}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-opacity mb-2"
                      title="Borrar este mensaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm space-y-2 w-full ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-xs'
                    }`}
                  >
                    {/* Photo / Image Attachment */}
                    {msg.image && (
                      <div className="relative rounded-xl overflow-hidden group/img cursor-pointer max-w-full">
                        <img
                          src={msg.image}
                          alt="Foto adjunta en el chat"
                          onClick={() => setExpandedImage(msg.image || null)}
                          className="w-full max-h-64 object-cover rounded-lg border border-black/10 dark:border-white/10 hover:scale-[1.01] transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => setExpandedImage(msg.image || null)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-1 text-[10px]"
                          title="Ver foto a tamaño completo"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Ampliar</span>
                        </button>
                      </div>
                    )}

                    {/* Message Text */}
                    {msg.text && (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Footer */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] ${
                        isMine ? 'text-emerald-200' : 'text-zinc-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMine && <CheckCheck className="w-3 h-3 ml-0.5 text-emerald-200" />}
                    </div>
                  </div>

                  {isMine && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation({ isOpen: true, type: 'message', messageId: msg.id })}
                      className="opacity-0 group-hover/msg:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-opacity mb-2"
                      title="Borrar este mensaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Floating Scroll Navigation */}
        {/* ----------------------------------------------------------- */}
        {isScrolledUp && (
          <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 ring-2 ring-white dark:ring-zinc-900 active:scale-95"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Bajar al último</span>
              {unreadWhileScrolled > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-600 text-[10px] font-extrabold flex items-center justify-center">
                  {unreadWhileScrolled}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* Selected Image Preview (Before Sending) */}
        {/* ----------------------------------------------------------- */}
        {selectedImage && (
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <img
                src={selectedImage}
                alt="Vista previa a enviar"
                className="w-14 h-14 object-cover rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-sm"
              />
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  Foto lista para enviar
                </span>
                <p className="text-[11px] text-zinc-500">
                  Se enviará en el chat de la conversación.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Quitar foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* Quick Responses Popover Menu */}
        {/* ----------------------------------------------------------- */}
        {showQuickReplies && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-700 space-y-2 shrink-0 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Respuestas Rápidas para Trato en Mano:
              </span>
              <button
                type="button"
                onClick={() => setShowQuickReplies(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {QUICK_RESPONSES.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputMessage(q);
                    setShowQuickReplies(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 text-[11px] text-zinc-800 dark:text-zinc-200 truncate transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* Image Attachment Picker */}
        {/* ----------------------------------------------------------- */}
        {showImagePicker && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/90 border-t border-zinc-200 dark:border-zinc-700 space-y-3 shrink-0 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-500" />
                Subir Foto o Imagen al Chat:
              </span>
              <button
                type="button"
                onClick={() => setShowImagePicker(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct File Input */}
            <div>
              {imageUploadError && (
                <div className="p-2 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageUploadError}</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Subir foto desde mi ordenador o móvil</span>
              </button>
            </div>

            {/* Preset Samples */}
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1.5">
                O adjuntar foto tipo:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_PHOTO_SAMPLES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(preset.url);
                      setShowImagePicker(false);
                    }}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 bg-white dark:bg-zinc-900 text-left transition-all group flex flex-col items-center"
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-12 object-cover rounded-md mb-1"
                    />
                    <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 text-center truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* Action Toolbar */}
        {/* ----------------------------------------------------------- */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Respuestas Rápidas</span>
            </button>

            <button
              onClick={() => setShowMeetupModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>Punto de Encuentro</span>
            </button>
          </div>

          {currentUser.id === activeConv.buyerId ? (
            <button
              onClick={handleQuickDealOffer}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Comprar Juego ({activeConv.gamePrice} €)</span>
            </button>
          ) : (
            <span className="text-[11px] text-zinc-400 font-medium px-2 py-1">
              Eres el vendedor de este juego
            </span>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* Chat Input Field & Attachment Controls */}
        {/* ----------------------------------------------------------- */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowImagePicker(!showImagePicker)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              selectedImage || showImagePicker
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Subir foto al chat"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Subir Foto</span>
          </button>

          <input
            type="text"
            placeholder={selectedImage ? 'Añade un comentario a la foto...' : 'Escribe un mensaje...'}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() && !selectedImage}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* Delete Confirmation Modal */}
      {/* ------------------------------------------------------------- */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                {deleteConfirmation.type === 'message' && '¿Borrar este mensaje?'}
                {deleteConfirmation.type === 'clear' && '¿Vaciar todos los mensajes?'}
                {deleteConfirmation.type === 'conversation' && '¿Eliminar conversación?'}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {deleteConfirmation.type === 'message' && 'Esta acción eliminará el mensaje permanentemente.'}
                {deleteConfirmation.type === 'clear' && 'Se borrarán todos los mensajes de esta conversación.'}
                {deleteConfirmation.type === 'conversation' && 'Se eliminará la conversación completa y todos sus mensajes.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'message' })}
                className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Fullscreen Image Preview Lightbox */}
      {/* ------------------------------------------------------------- */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center gap-1"
            >
              <X className="w-5 h-5" />
              <span>Cerrar</span>
            </button>
            <img
              src={expandedImage}
              alt="Vista ampliada"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Propose Meetup Spot Modal */}
      {/* ------------------------------------------------------------- */}
      {showMeetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Coordinar Lugar de Encuentro
              </h4>
              <button
                onClick={() => setShowMeetupModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Meeting points selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 text-xs">
                Lugar de encuentro acordado:
              </label>
              <input
                type="text"
                value={selectedSafePoint}
                onChange={e => setSelectedSafePoint(e.target.value)}
                placeholder="Ej. Estación de Atocha, Puerta del Sol, etc."
                className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SAFE_MEETUP_POINTS.slice(0, 6).map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setSelectedSafePoint(`${pt.name} (${pt.city})`)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      selectedSafePoint.includes(pt.name)
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {pt.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Fecha del Trato Presencial
                  </label>
                  <select
                    value={meetupDate}
                    onChange={e => setMeetupDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
                  >
                    <option value="Hoy">Hoy</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Este sábado">Este sábado</option>
                    <option value="Este domingo">Este domingo</option>
                    <option value="La próxima semana">La próxima semana</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hora orientativa
                  </label>
                  <input
                    type="time"
                    value={meetupTime}
                    onChange={e => setMeetupTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                El pago se efectuará en mano al revisar el juego.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMeetupModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProposeMeetup}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Proponer en el Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
