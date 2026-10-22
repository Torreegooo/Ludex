import React, { useState, useEffect } from 'react';
import { GameItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatAuctionCountdown } from '../utils/security';
import { getPlatformConfig } from '../utils/platformStyles';
import {
  Gavel,
  ShieldCheck,
  MapPin,
  TrendingDown,
  Clock,
  Sparkles,
  MessageSquare,
  Eye,
  CheckCircle,
  Trash2,
  Heart
} from 'lucide-react';

interface GameCardProps {
  game: GameItem;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const {
    setSelectedGameModal,
    openChatForGame,
    setSelectedUserProfile,
    currentUser,
    deleteGame,
    toggleFavorite,
    isFavorite,
    t,
    language
  } = useApp();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'davidtorrego1@gmail.com';
  const isOwner = currentUser?.id === game.sellerId;
  const canDelete = true;
  const isFav = isFavorite(game.id);

  const platformConfig = getPlatformConfig(game.platform);

  const seller = game.seller || {
    id: game.sellerId || 'seller',
    name: 'Vendedor LUDEX',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5.0,
    totalDeals: 1,
    verificationLevel: 'Verificado',
    location: `${game.city || 'Madrid'} Centro`,
    phoneVerified: true,
  };

  const mainImage = (game.images && game.images.length > 0 && game.images[0])
    ? game.images[0]
    : 'https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80';

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    game.auctionEndsAt ? formatAuctionCountdown(game.auctionEndsAt) : null
  );

  // Update auction countdown every second
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

  const isHighlyCompetitive = discountPercent >= 15;

  const getPlatformBadgeColor = (platform: string) => {
    if (platform.includes('PlayStation')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    if (platform.includes('Switch') || platform.includes('Nintendo')) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    if (platform.includes('Xbox')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (platform.includes('Retro')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col">
      
      {/* Prominent Official Console Header Banner */}
      <div
        onClick={() => setSelectedGameModal(game)}
        className={`px-3 py-1.5 flex items-center justify-between text-xs font-black tracking-wider uppercase cursor-pointer border-b border-black/10 dark:border-white/10 ${platformConfig.badgeBg} ${platformConfig.textColor} shadow-xs transition-opacity hover:opacity-95`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{platformConfig.iconSymbol}</span>
          <span className="font-black tracking-wide drop-shadow-sm">{platformConfig.name}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/25 text-white font-bold backdrop-blur-xs border border-white/20">
          {game.listingType === 'auction' ? `🔨 ${t('card_auction')}` : `🤝 ${t('card_handshake')}`}
        </span>
      </div>

      {/* Top Image & Badges */}
      <div
        className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden cursor-pointer"
        onClick={() => setSelectedGameModal(game)}
      >
        <img
          src={mainImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-md shadow-lg uppercase tracking-wider border ${platformConfig.badgeBg} ${platformConfig.textColor} ${platformConfig.borderColor}`}
            >
              {platformConfig.shortName}
            </span>

            {isHighlyCompetitive && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                <TrendingDown className="w-3 h-3" />
                -{discountPercent}% {t('card_bargain')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {game.listingType === 'auction' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black flex items-center gap-1 shadow-sm">
                <Gavel className="w-3 h-3" />
                {t('card_auction')}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(game.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-md ${
                isFav
                  ? 'bg-rose-600 text-white ring-2 ring-white/80'
                  : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80'
              }`}
              title={isFav ? t('card_unsave_tooltip') : t('card_save_tooltip')}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom overlay in image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
          <div className="text-xs font-medium bg-black/60 backdrop-blur-md px-2 py-1 rounded text-zinc-200 border border-white/10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {game.condition}
          </div>

          {game.listingType === 'auction' && countdown && (
            <div className="text-xs font-mono font-semibold bg-black/80 backdrop-blur-md px-2 py-1 rounded text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown.text}
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Prominent Platform & Title */}
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${platformConfig.badgeBg} ${platformConfig.textColor}`}>
              {platformConfig.shortName}
            </span>
          </div>

          <h3
            onClick={() => setSelectedGameModal(game)}
            className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-emerald-500 cursor-pointer transition-colors"
            title={game.title}
          >
            {game.title}
          </h3>

          {/* Location & Box / Manual status */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
              {game.city} ({game.neighborhood})
            </span>
            <span>•</span>
            <span>{game.hasOriginalBox ? 'Caja Original' : 'Solo cartucho/disco'}</span>
          </div>

          {/* Pricing Details */}
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                {game.listingType === 'auction' ? 'Puja Actual' : 'Precio Trato en Mano'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                  {game.listingType === 'auction'
                    ? (game.currentBid || game.startingBid)
                    : game.price}{' '}
                  €
                </span>
                <span className="text-xs text-zinc-400 line-through">
                  {game.estimatedMarketPrice} €
                </span>
              </div>
            </div>

            {game.listingType === 'auction' && (
              <span className="text-[11px] text-amber-500 dark:text-amber-400 font-medium">
                {game.bids?.length || 0} pujas
              </span>
            )}
          </div>
        </div>

        {/* Seller Info & Action Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          {/* Seller Snippet */}
          <button
            onClick={() => setSelectedUserProfile(seller as any)}
            className="flex items-center gap-2 text-left group/seller overflow-hidden"
            title="Ver perfil y valoraciones del vendedor"
          >
            <img
              src={seller.avatar}
              alt={seller.name}
              className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-zinc-300 dark:ring-zinc-700"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover/seller:text-emerald-500 truncate flex items-center gap-1">
                {seller.name}
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                ★ {seller.rating} ({seller.totalDeals} {t('card_deals_count')})
              </p>
            </div>
          </button>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {canDelete && (
              isConfirmingDelete ? (
                <div
                  className="flex items-center gap-1 bg-rose-600/20 border border-rose-500 rounded-lg p-0.5 animate-in fade-in"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGame(game.id);
                      setIsConfirmingDelete(false);
                    }}
                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold shadow-sm"
                    title="Confirmar eliminación permanente"
                  >
                    ¿Borrar? Sí
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmingDelete(false);
                    }}
                    className="px-1.5 py-1 text-zinc-400 hover:text-white text-[10px]"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmingDelete(true);
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/30 transition-colors"
                  title="Borrar anuncio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )
            )}
            <button
              onClick={() => openChatForGame(game)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-cyan-500 hover:border-cyan-500/50 transition-colors"
              title="Abrir chat con el vendedor"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedGameModal(game)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('card_view_details')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
