import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Platform, ProductCondition } from '../types';
import { getPlatformConfig } from '../utils/platformStyles';
import { TranslationKey } from '../i18n/translations';
import {
  Tag,
  SlidersHorizontal,
  Flame,
  Gavel,
  ShoppingBag,
  MapPin,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Heart,
  Navigation,
  Layers
} from 'lucide-react';

export interface ConsoleGroup {
  id: string;
  labelKey: TranslationKey;
  defaultLabel: string;
  icon: string;
  platforms: Platform[];
}

export const CONSOLE_GROUPS: ConsoleGroup[] = [
  {
    id: 'playstation',
    labelKey: 'group_playstation',
    defaultLabel: 'PlayStation',
    icon: '⚡',
    platforms: [
      'PlayStation 5',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation 2',
      'PlayStation 1',
      'PlayStation Portable (PSP)',
      'PlayStation Vita',
      'PlayStation VR / VR2',
    ]
  },
  {
    id: 'nintendo_home',
    labelKey: 'group_nintendo_home',
    defaultLabel: 'Nintendo Sobremesa',
    icon: '🔴',
    platforms: [
      'Nintendo Switch 2',
      'Nintendo Switch',
      'Nintendo Wii U',
      'Nintendo Wii',
      'Nintendo GameCube',
      'Nintendo 64 (N64)',
      'Super Nintendo (SNES)',
      'Nintendo (NES)',
      'Virtual Boy',
    ]
  },
  {
    id: 'nintendo_handheld',
    labelKey: 'group_nintendo_handheld',
    defaultLabel: 'Nintendo Portátiles',
    icon: '✨',
    platforms: [
      'Nintendo 3DS / 2DS',
      'Nintendo DS',
      'Game Boy Advance (GBA)',
      'Game Boy Color',
      'Game Boy (Clásica)',
      'Game Boy Micro',
      'Game & Watch',
      'Pokémon Mini',
    ]
  },
  {
    id: 'xbox',
    labelKey: 'group_xbox',
    defaultLabel: 'Xbox',
    icon: '🟢',
    platforms: [
      'Xbox Series X/S',
      'Xbox One',
      'Xbox 360',
      'Xbox Original',
    ]
  },
  {
    id: 'sega',
    labelKey: 'group_sega',
    defaultLabel: 'SEGA',
    icon: '🌀',
    platforms: [
      'SEGA Dreamcast',
      'SEGA Saturn',
      'SEGA Mega Drive',
      'SEGA Mega-CD / 32X',
      'SEGA Master System',
      'SEGA Game Gear',
    ]
  },
  {
    id: 'retro_legends',
    labelKey: 'group_retro_legends',
    defaultLabel: 'Retro & Arcade',
    icon: '👑',
    platforms: [
      'Neo Geo AES / MVS',
      'Neo Geo CD',
      'Neo Geo Pocket / Color',
      'PC Engine / TurboGrafx-16',
      'Atari 2600 / 7800',
      'Atari Jaguar / Lynx',
      '3DO Interactive Multiplayer',
      'WonderSwan / Color',
      'Amiga CD32 / Commodore',
      'MSX / Spectrum / Retro PC',
      'Philips CD-i',
    ]
  },
  {
    id: 'pc_handheld',
    labelKey: 'group_pc_handheld',
    defaultLabel: 'PC & Portátiles',
    icon: '💻',
    platforms: [
      'Steam Deck / PC Portátil',
      'PC Físico',
    ]
  }
];

export const ALL_PLATFORMS: (Platform | 'Todas')[] = [
  'Todas',
  ...CONSOLE_GROUPS.flatMap(g => g.platforms)
];
export const PLATFORMS: (Platform | 'Todas')[] = ALL_PLATFORMS;

const CONDITIONS: (ProductCondition | 'Cualquier Estado')[] = [
  'Cualquier Estado',
  'Precintado / Nuevo',
  'Como nuevo (10/10)',
  'Muy bueno (8-9/10)',
  'Buen estado (7/10)',
  'Aceptable (con marcas)'
];

const CITIES = ['Todas', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza', 'Málaga'];

export const FilterBar: React.FC = () => {
  const {
    selectedFamily,
    setSelectedFamily,
    selectedPlatform,
    setSelectedPlatform,
    selectedCondition,
    setSelectedCondition,
    listingTypeFilter,
    setListingTypeFilter,
    competitiveOnly,
    setCompetitiveOnly,
    bargainOnly,
    setBargainOnly,
    favoritesOnly,
    setFavoritesOnly,
    favorites,
    selectedCity,
    setSelectedCity,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    setIsSafePointsMapOpen,
    t,
    language,
  } = useApp();

  const isEn = language === 'en';

  const displayedPlatforms = React.useMemo(() => {
    if (selectedFamily === 'all') {
      return ALL_PLATFORMS;
    }
    const group = CONSOLE_GROUPS.find(g => g.id === selectedFamily);
    return group ? (['Todas', ...group.platforms] as (Platform | 'Todas')[]) : ALL_PLATFORMS;
  }, [selectedFamily]);

  const resetFilters = () => {
    setSelectedPlatform('Todas');
    setSelectedFamily('all');
    setSelectedCondition('Cualquier Estado');
    setListingTypeFilter('all');
    setCompetitiveOnly(false);
    setBargainOnly(false);
    setFavoritesOnly(false);
    setSelectedCity('Todas');
    setMaxPrice(200);
    setSortBy('relevance');
  };

  const hasActiveFilters =
    selectedFamily !== 'all' ||
    selectedPlatform !== 'Todas' ||
    selectedCondition !== 'Cualquier Estado' ||
    listingTypeFilter !== 'all' ||
    competitiveOnly ||
    bargainOnly ||
    favoritesOnly ||
    selectedCity !== 'Todas' ||
    maxPrice < 200 ||
    sortBy !== 'relevance';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mb-6 transition-colors">
      
      {/* Top Row: Sale Type and Competitive Price Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        
        {/* Type Tabs: Direct vs Auction */}
        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setListingTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              listingTypeFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {t('filter_all')}
          </button>
          <button
            onClick={() => setListingTypeFilter('direct')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              listingTypeFilter === 'direct'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('filter_direct')}</span>
          </button>
          <button
            onClick={() => setListingTypeFilter('auction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              listingTypeFilter === 'auction'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('filter_auctions')}</span>
          </button>
        </div>

        {/* Filter Badges & Quick Tools */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Favorites filter toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              favoritesOnly
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            title="Mostrar solo los juegos que has guardado"
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-current' : 'text-rose-500'}`} />
            <span>{t('filter_saved')} ({favorites.length})</span>
          </button>

          {/* Bargain filter toggle (-30%) */}
          <button
            onClick={() => setBargainOnly(!bargainOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              bargainOnly
                ? 'bg-amber-500 text-black border-amber-500 shadow-sm font-bold'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            title="Mostrar solo chollos y gangas con más del 30% de descuento respecto a su valor de mercado"
          >
            <Flame className={`w-3.5 h-3.5 ${bargainOnly ? 'fill-current text-black' : 'text-amber-500'}`} />
            <span>{t('filter_bargains')}</span>
          </button>

          {/* Tool: Safe Meetup Points Map */}
          <button
            type="button"
            onClick={() => setIsSafePointsMapOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Ver mapa de puntos de encuentro seguros con policía y cámaras"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">{t('filter_safe_points')}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1.5 transition-colors ml-auto sm:ml-0"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{t('filter_clear')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Console Family Category Filter Tabs */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800/60">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {isEn ? 'Families' : 'Familias'}:
        </span>
        <button
          type="button"
          onClick={() => {
            setSelectedFamily('all');
          }}
          className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-all font-semibold flex items-center gap-1.5 ${
            selectedFamily === 'all'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>🌐</span>
          <span>{t('group_all')}</span>
        </button>
        {CONSOLE_GROUPS.map(grp => {
          const isFamActive = selectedFamily === grp.id;
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => {
                setSelectedFamily(grp.id);
                if (selectedPlatform !== 'Todas' && !grp.platforms.includes(selectedPlatform)) {
                  setSelectedPlatform('Todas');
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-all font-semibold flex items-center gap-1.5 ${
                isFamActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>{grp.icon}</span>
              <span>{t(grp.labelKey) || grp.defaultLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Middle Row: Platform Chips (Horizontal Scroll on Mobile) */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {t('filter_platform')}:
        </span>
        {displayedPlatforms.map(p => {
          const isSelected = selectedPlatform === p;
          if (p === 'Todas') {
            const currentGroup = CONSOLE_GROUPS.find(g => g.id === selectedFamily);
            const allLabel = currentGroup
              ? (isEn ? `All (${currentGroup.defaultLabel})` : `Todas (${currentGroup.defaultLabel})`)
              : t('filter_all_platforms');
            return (
              <button
                key={p}
                onClick={() => setSelectedPlatform('Todas')}
                className={`text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all font-bold ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {allLabel}
              </button>
            );
          }

          const cfg = getPlatformConfig(p);
          return (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all font-black flex items-center gap-1.5 shadow-2xs ${
                isSelected
                  ? `${cfg.badgeBg} ${cfg.textColor} ring-2 ring-white/50 shadow-md`
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="text-sm">{cfg.iconSymbol}</span>
              <span>{p}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Row: Condition, Location, Price Slider, Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        
        {/* Condition Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            {t('filter_condition')}
          </label>
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value as ProductCondition | 'Cualquier Estado')}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {CONDITIONS.map(c => (
              <option key={c} value={c}>
                {c === 'Cualquier Estado' && isEn ? 'Any Condition' : c}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span>{isEn ? 'Location for In-Person Deal' : 'Zona para Trato en Persona'}</span>
          </label>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {CITIES.map(city => (
              <option key={city} value={city}>
                {city === 'Todas' ? (isEn ? 'All cities' : 'Todas las ciudades') : `${city} ${isEn ? '& area' : 'y alrededores'}`}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
            <span>{t('filter_max_price')}</span>
            <span className="font-mono text-emerald-500 font-bold">{maxPrice} €</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Sorting Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-zinc-400" />
            <span>{t('filter_sort')}</span>
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="relevance">{t('filter_sort_relevance')}</option>
            <option value="price_asc">{t('filter_sort_price_asc')}</option>
            <option value="price_desc">{t('filter_sort_price_desc')}</option>
            <option value="market_discount">{t('filter_sort_discount')}</option>
            <option value="auction_ending">{t('filter_sort_auction_end')}</option>
          </select>
        </div>

      </div>

    </div>
  );
};
