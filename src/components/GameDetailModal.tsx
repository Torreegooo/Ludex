import React, { useState, useEffect } from 'react';
import { GameItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatAuctionCountdown } from '../utils/security';
import { SAFE_MEETUP_POINTS } from '../data/mockData';
import { getPlatformConfig } from '../utils/platformStyles';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Gavel,
  MessageSquare,
  Clock,
  TrendingDown,
  MapPin,
  Sparkles,
  Lock,
  ArrowRight,
  Handshake,
  DollarSign,
  Trash2
} from 'lucide-react';

interface GameDetailModalProps {
  game: GameItem;
  onClose: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, onClose }) => {
  const {
    currentUser,
    deleteGame,
    placeBid,
    createPurchaseRequest,
    openChatForGame,
    setSelectedUserProfile,
    setActiveTab,
    setIsSecurityModalOpen,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'davidtorrego1@gmail.com';
  const isOwner = currentUser?.id === game.sellerId;
  const canDelete = true;

  const seller = game.seller || {
    id: game.sellerId || 'seller',
    name: 'Vendedor LUDEX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    location: `${game.city || 'Madrid'} Centro`,
    rating: 5.0,
    totalDeals: 1,
    verificationLevel: 'Verificado',
    memberSince: 'Septiembre 2026',
    punctualityScore: 100,
    itemAccuracyScore: 100,
    communicationScore: 100,
    publicKeyFingerprint: 'LUDEX-USER:E2EE:0001',
    phoneVerified: true,
  };

  const isOwnItem = isOwner || (currentUser && currentUser.id === seller.id);
  const platformConfig = getPlatformConfig(game.platform);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bidInput, setBidInput] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');
  const [bidSuccess, setBidSuccess] = useState<string>('');

  // Purchase request state
  const [proposedPrice, setProposedPrice] = useState<number>(game.price);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo en mano' | 'Bizum presencial'>('Efectivo en mano');
  const [meetupLocation, setMeetupLocation] = useState<string>(
    SAFE_MEETUP_POINTS.find(p => p.city === game.city)?.name || `${game.city} Centro`
  );
  const [dealRequestedSuccess, setDealRequestedSuccess] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string>('');

  // Auction countdown
  const [countdown, setCountdown] = useState(() =>
    game.auctionEndsAt ? formatAuctionCountdown(game.auctionEndsAt) : null
  );

  useEffect(() => {
    if (!game.auctionEndsAt || game.listingType !== 'auction') return;
    const interval = setInterval(() => {
      setCountdown(formatAuctionCountdown(game.auctionEndsAt!));
    }, 1000);
    return () => clearInterval(interval);
  }, [game.auctionEndsAt, game.listingType]);

  const discountPercent = Math.round(
    ((game.estimatedMarketPrice - (game.listingType === 'auction' ? (game.currentBid || game.startingBid || game.price) : game.price)) /
      game.estimatedMarketPrice) *
      100
  );

  const minNextBid = (game.currentBid || game.startingBid || 0) + (game.minBidIncrement || 2);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess('');

    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Introduce una cantidad válida.');
      return;
    }

    const res = placeBid(game.id, amount);
    if (!res.success) {
      setBidError(res.message);
    } else {
      setBidSuccess(res.message);
      setBidInput('');
    }
  };

  const handleRequestPurchase = () => {
    try {
      setRequestError('');
      const res = createPurchaseRequest(game.id, proposedPrice, paymentMethod, meetupLocation);
      if (res) {
        setDealRequestedSuccess(true);
      }
    } catch (err: any) {
      setRequestError(err.message || 'Error al solicitar la compra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Prominent Official Console Header Strip */}
        <div className={`px-5 py-2.5 flex items-center justify-between text-xs font-black tracking-wider uppercase border-b border-black/10 dark:border-white/10 ${platformConfig.badgeBg} ${platformConfig.textColor} shadow-xs`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{platformConfig.iconSymbol}</span>
            <span className="text-sm font-black tracking-wide drop-shadow-xs">CONSOLA: {platformConfig.name}</span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/25 text-white font-extrabold border border-white/20">
            {game.listingType === 'auction' ? '🔨 Subasta en Vivo' : '🤝 Trato en Mano'}
          </span>
        </div>

        {/* Top Header */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm border ${platformConfig.badgeBg} ${platformConfig.textColor} ${platformConfig.borderColor}`}>
              {platformConfig.shortName}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              ID: {game.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              isConfirmingDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-600/20 border border-rose-500 rounded-lg p-1 animate-in fade-in">
                  <span className="text-xs text-rose-300 font-bold px-1">¿Eliminar anuncio?</span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteGame(game.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm"
                  >
                    Sí, Borrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-1.5 py-1 text-zinc-400 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  title="Eliminar este anuncio permanentemente"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Borrar Anuncio</span>
                </button>
              )
            )}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantía Presencial</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-zinc-200 dark:divide-zinc-800 space-y-6">
          
          {/* Main Top Grid: Gallery & Primary Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            
            {/* Gallery Column */}
            <div>
              <div className="aspect-4/3 w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
                <img
                  src={game.images[activeImageIndex] || game.images[0]}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {game.condition}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {game.images.length > 1 && (
                <div className="flex items-center gap-2 mt-2.5 overflow-x-auto">
                  {game.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Physical Condition Checklist */}
              <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Informe Técnico del Estado Físico
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className={game.hasOriginalBox ? 'text-emerald-500' : 'text-zinc-400'}>●</span>
                    <span>Caja Original: <strong>{game.hasOriginalBox ? 'Sí' : 'No'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={game.hasManual ? 'text-emerald-500' : 'text-zinc-400'}>●</span>
                    <span>Manual / Folletos: <strong>{game.hasManual ? 'Sí' : 'No'}</strong></span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="text-emerald-500">●</span>
                    <span>Disco / Cartucho: <strong>{game.discCondition}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info & Pricing Column */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
                  {game.title}
                </h1>

                <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{game.city} ({game.neighborhood}) • Solo Trato Presencial</span>
                </div>

                {/* Price and Competitive Score Card */}
                <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        {game.listingType === 'auction' ? 'Puja Más Alta' : 'Precio Directo en Mano'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-white">
                          {game.listingType === 'auction'
                            ? (game.currentBid || game.startingBid)
                            : game.price}{' '}
                          €
                        </span>
                        <span className="text-sm text-zinc-400 line-through">
                          {game.estimatedMarketPrice} €
                        </span>
                      </div>
                    </div>

                    {discountPercent > 0 && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {discountPercent}% de Ahorro
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          vs. valor medio mercado
                        </p>
                      </div>
                    )}
                  </div>

                  {game.listingType === 'auction' && countdown && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Tiempo para el cierre:
                      </span>
                      <span className="text-amber-500 font-bold text-sm">
                        {countdown.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Descripción del Vendedor
                  </h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-800/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Chat action button */}
              <div className="mt-5">
                <button
                  onClick={() => {
                    openChatForGame(game);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat con {seller.name}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Section 2: Auction Bidding or Direct Buy Request */}
          <div className="pt-6">
            {game.listingType === 'auction' ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-500" />
                    Pujar en esta Subasta
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    Puja mínima: <strong className="text-zinc-900 dark:text-white">{minNextBid} €</strong>
                  </span>
                </div>

                {!isOwnItem ? (
                  <form onSubmit={handlePlaceBid} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={minNextBid}
                        step="1"
                        placeholder={`Introduce al menos ${minNextBid} €`}
                        value={bidInput}
                        onChange={e => setBidInput(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                        €
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Confirmar Puja</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-amber-500">
                    Eres el propietario de esta subasta. Puedes ver el historial de pujas transparente abajo.
                  </p>
                )}

                {bidError && <p className="text-xs text-rose-500 mt-2 font-medium">{bidError}</p>}
                {bidSuccess && <p className="text-xs text-emerald-500 mt-2 font-medium">{bidSuccess}</p>}

                {/* Bids history table */}
                <div className="mt-4 pt-3 border-t border-amber-500/20">
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Historial Público de Pujas Auditadas ({game.bids?.length || 0})
                  </h4>
                  <div className="max-h-36 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                    {game.bids && game.bids.length > 0 ? (
                      game.bids.map(b => (
                        <div key={b.id} className="py-2 flex items-center justify-between">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {b.bidderName}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-amber-500">
                              {b.amount} €
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-2 text-xs text-zinc-400">
                        Aún no hay pujas. Sé el primero con una puja de {game.startingBid}€.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Direct Buy In-Person Request Form */
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-emerald-500" />
                    Solicitar Compra con Trato en Persona
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Pago 100% presencial tras verificar
                  </span>
                </div>

                {!dealRequestedSuccess ? (
                  !isOwnItem ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Offered Price */}
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Precio Acordado / Oferta (€)
                          </label>
                          <input
                            type="number"
                            value={proposedPrice}
                            onChange={e => setProposedPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-xs"
                          />
                        </div>

                        {/* In-Person Payment Method */}
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Método de Pago Presencial
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value as any)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                          >
                            <option value="Efectivo en mano">Efectivo en mano (billetes revisados)</option>
                            <option value="Bizum presencial">Bizum presencial cara a cara</option>
                          </select>
                        </div>

                        {/* Proposed Safe Spot */}
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Punto de Encuentro Seguro Propuesto
                          </label>
                          <select
                            value={meetupLocation}
                            onChange={e => setMeetupLocation(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                          >
                            {SAFE_MEETUP_POINTS.map(p => (
                              <option key={p.id} value={`${p.name} (${p.city})`}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {requestError && (
                        <p className="text-xs text-rose-500 font-semibold">{requestError}</p>
                      )}

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-zinc-500 leading-tight">
                          El vendedor recibirá una <strong>notificación push en tiempo real</strong> para aceptar el trato. Solo tras su aprobación se desbloquea el código OTP de entrega.
                        </p>
                        <button
                          onClick={handleRequestPurchase}
                          className="shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Enviar Solicitud Push</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Eres el vendedor de este artículo. Si un comprador te envía una propuesta, recibirás una notificación push instantánea.
                    </p>
                  )
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Solicitud de compra enviada al vendedor!
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Hemos emitido la notificación a <strong>{seller.name}</strong>. En cuanto acepte la transacción, podréis coordinar la hora exacta en el chat y realizar el intercambio en el punto acordado.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('history');
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline mt-1"
                    >
                      <span>Ver estado en el registro de tratos</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Section 3: Seller Trust & Reputation Profile */}
          <div className="pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Garantía y Reputación del Vendedor
            </h4>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {seller.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {seller.verificationLevel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                    ★ {seller.rating} • {seller.totalDeals} tratos presenciales completados
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Huella Clave: {seller.publicKeyFingerprint}
                  </p>
                </div>
              </div>

              {/* Trust breakdown bars */}
              <div className="w-full sm:w-auto grid grid-cols-3 gap-3 text-center border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
                <div>
                  <span className="block text-sm font-bold font-mono text-emerald-500">
                    {seller.punctualityScore}%
                  </span>
                  <span className="text-[10px] text-zinc-500">Puntualidad</span>
                </div>
                <div>
                  <span className="block text-sm font-bold font-mono text-emerald-500">
                    {seller.itemAccuracyScore}%
                  </span>
                  <span className="text-[10px] text-zinc-500">Fidelidad</span>
                </div>
                <div>
                  <span className="block text-sm font-bold font-mono text-emerald-500">
                    {seller.communicationScore}%
                  </span>
                  <span className="text-[10px] text-zinc-500">Comunicación</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
