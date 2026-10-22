import React from 'react';
import { useApp } from '../context/AppContext';
import { Platform } from '../types';
import {
  ShieldCheck,
  Disc,
  Gamepad2,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  MapPin,
  TrendingDown,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PlatformQuickCard {
  name: string;
  platform: Platform;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  description: string;
}

export const SecondHandHeroSection: React.FC = () => {
  const { setSelectedPlatform, setIsCreateModalOpen, games, t, language } = useApp();
  const isEn = language === 'en';

  const platformCards: PlatformQuickCard[] = [
    {
      name: 'PlayStation (PS5 / PS4)',
      platform: 'PlayStation 5',
      color: 'from-blue-900/40 via-blue-950/20 to-zinc-900',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      icon: '⚡',
      description: isEn
        ? '4K Blu-ray discs, steelbooks, RPGs and Sony exclusives.'
        : 'Discos Blu-ray 4K, Steelbooks, RPGs y exclusivas de Sony.'
    },
    {
      name: 'Nintendo (Switch / Switch 2)',
      platform: 'Nintendo Switch',
      color: 'from-red-900/40 via-rose-950/20 to-zinc-900',
      borderColor: 'border-red-500/30 hover:border-red-500/60',
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      icon: '🔴',
      description: isEn
        ? 'Original cartridges, Zelda, Mario and Pokémon sagas.'
        : 'Cartuchos originales, sagas de Zelda, Mario y Pokémon.'
    },
    {
      name: 'Xbox (Series X|S / One)',
      platform: 'Xbox Series X/S',
      color: 'from-emerald-900/40 via-green-950/20 to-zinc-900',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      icon: '🟢',
      description: isEn
        ? 'Physical editions, backward compatible with Xbox 360 and classics.'
        : 'Ediciones físicas, retrocompatibles con Xbox 360 y clásicos.'
    },
    {
      name: isEn ? 'Retro Gaming & Collectibles' : 'Retro Gaming & Coleccionismo',
      platform: 'Retro / Nintendo GBA / N64',
      color: 'from-purple-900/40 via-violet-950/20 to-zinc-900',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      badgeBg: 'bg-purple-600',
      badgeText: 'text-white',
      icon: '👾',
      description: isEn
        ? 'GBA, N64, PS2, PS1, original cardboard boxes and relics.'
        : 'GBA, N64, PS2, PS1, cajas de cartón originales y reliquias.'
    }
  ];

  return (
    <div className="mb-8 rounded-2xl bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
      
      {/* Subtle Glow Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero_badge')}</span>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            {games.length} {isEn ? 'titles in in-person catalog' : 'títulos en catálogo presencial'}
          </span>
        </div>

        {/* Main Pitch */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {t('hero_title_1')}{' '}
            <span className="text-emerald-400">{t('hero_title_2')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {t('hero_subtitle')}
          </p>
        </div>

        {/* Guarantee Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">{t('hero_guarantee_2_title')}</strong>
              <span className="text-zinc-400 text-[10px]">{t('hero_guarantee_2_desc')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <TrendingDown className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">{t('hero_guarantee_1_title')}</strong>
              <span className="text-zinc-400 text-[10px]">{t('hero_guarantee_1_desc')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white block text-[11px]">{t('hero_guarantee_3_title')}</strong>
              <span className="text-zinc-400 text-[10px]">{t('hero_guarantee_3_desc')}</span>
            </div>
          </div>
        </div>

        {/* Platform Quick Filter Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {isEn ? 'Browse by Video Game Platform:' : 'Explorar por Plataforma de Videojuegos:'}
            </span>
            <button
              onClick={() => setSelectedPlatform('Todas')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{isEn ? 'View all' : 'Ver todas'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {platformCards.map(card => (
              <button
                key={card.name}
                onClick={() => setSelectedPlatform(card.platform)}
                className={`p-3.5 rounded-xl bg-gradient-to-br ${card.color} border ${card.borderColor} text-left transition-all hover:scale-[1.02] active:scale-[0.98] group flex flex-col justify-between shadow-sm`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{card.icon}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${card.badgeBg} ${card.badgeText} uppercase tracking-wider`}>
                      {isEn ? 'Filter' : 'Filtrar'}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    {card.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('hero_cta_sell')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
