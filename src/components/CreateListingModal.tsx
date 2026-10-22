import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Platform, ProductCondition, ListingType } from '../types';
import { SAFE_MEETUP_POINTS, ADMIN_USER } from '../data/mockData';
import { compressImage } from '../utils/imageOptimizer';
import { GAME_PRESETS, GamePreset } from '../utils/gamePresets';
import {
  X,
  PlusCircle,
  Gavel,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Link as LinkIcon,
  Tag,
  Star,
  Check
} from 'lucide-react';

const CONSOLE_SECTIONS: { group: string; platforms: Platform[] }[] = [
  {
    group: 'PlayStation',
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
    group: 'Nintendo Sobremesa',
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
    group: 'Nintendo Portátiles',
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
    group: 'Xbox',
    platforms: [
      'Xbox Series X/S',
      'Xbox One',
      'Xbox 360',
      'Xbox Original',
    ]
  },
  {
    group: 'SEGA',
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
    group: 'Retro Clásicos & Arcade',
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
    group: 'PC & Portátiles PC',
    platforms: [
      'Steam Deck / PC Portátil',
      'PC Físico',
    ]
  }
];

const POPULAR_PLATFORMS: Platform[] = CONSOLE_SECTIONS.flatMap(s => s.platforms);

const CONDITIONS: ProductCondition[] = [
  'Precintado / Nuevo',
  'Como nuevo (10/10)',
  'Muy bueno (8-9/10)',
  'Buen estado (7/10)',
  'Aceptable (con marcas)'
];

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Alicante'];

export const CreateListingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addGame, currentUser, setCurrentUser, setIsAuthModalOpen, setAuthMode } = useApp();

  // Core listing state
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>('PlayStation 5');
  const [condition, setCondition] = useState<ProductCondition>('Como nuevo (10/10)');
  const [hasOriginalBox, setHasOriginalBox] = useState(true);
  const [hasManual, setHasManual] = useState(true);
  const [discCondition, setDiscCondition] = useState<'Sin marcas' | 'Microrayas superficiales' | 'Excelente' | 'No aplica (Cartucho original)' | 'Cartucho Switch 2 Impecable'>('Sin marcas');

  const [listingType, setListingType] = useState<ListingType>('direct');
  const [price, setPrice] = useState<number>(45);
  const [estimatedMarketPrice, setEstimatedMarketPrice] = useState<number>(65);

  const [startingBid, setStartingBid] = useState<number>(35);
  const [minBidIncrement, setMinBidIncrement] = useState<number>(2);
  const [auctionDurationHours, setAuctionDurationHours] = useState<number>(24);

  // Photos state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80'
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageProcessStatus, setImageProcessStatus] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location & Description
  const [city, setCity] = useState(currentUser?.location?.split(' ')[0] || 'Madrid');
  const [neighborhood, setNeighborhood] = useState('Centro / Sol');
  const [description, setDescription] = useState(
    'Videojuego en perfecto estado de conservación. Caja y cartucho revisados, listos para prueba y entrega en mano.'
  );

  // Discount calculation
  const effectivePrice = listingType === 'direct' ? price : startingBid;
  const discountPercent = estimatedMarketPrice > effectivePrice
    ? Math.round(((estimatedMarketPrice - effectivePrice) / estimatedMarketPrice) * 100)
    : 0;

  // Apply a preset
  const handleApplyPreset = (preset: GamePreset) => {
    setTitle(preset.title);
    setPlatform(preset.platform);
    setCondition(preset.condition);
    setHasOriginalBox(preset.hasOriginalBox);
    setHasManual(preset.hasManual);
    setDiscCondition(preset.discCondition);
    setPrice(preset.price);
    setEstimatedMarketPrice(preset.estimatedMarketPrice);
    setListingType(preset.listingType);
    if (preset.listingType === 'auction') {
      setStartingBid(preset.price);
    }
    setDescription(preset.description);
    setImages([preset.coverImage]);
    setUploadError('');
    setShowPresets(false);
  };

  // Handle image files with on-the-fly client compression
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setIsProcessingImage(true);
    setImageProcessStatus('Optimizando fotos para publicación instantánea...');

    const newOptimizedImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const result = await compressImage(file, 960, 960, 0.82);
        newOptimizedImages.push(result.dataUrl);
      } catch (err: any) {
        console.warn('Error compressing photo:', err);
      }
    }

    setIsProcessingImage(false);
    setImageProcessStatus('');

    if (newOptimizedImages.length === 0) {
      setUploadError('No se pudo procesar la imagen seleccionada. Prueba con un archivo PNG, JPG o WEBP.');
      return;
    }

    setImages(prev => [...newOptimizedImages, ...prev]);
  };

  // Handle Add image by URL
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUploadError('Por favor introduce un enlace web válido (https://...)');
      return;
    }
    setImages(prev => [url, ...prev]);
    setUrlInput('');
    setUploadError('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };

  // Submit and publish online
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!currentUser) {
      setCurrentUser(ADMIN_USER);
    }

    if (!title.trim()) {
      setUploadError('Por favor, indica el título del videojuego.');
      return;
    }

    if (images.length === 0) {
      setUploadError('Debes incluir al menos una imagen o foto del videojuego.');
      return;
    }

    const finalPrice = listingType === 'direct' ? Number(price) : Number(startingBid);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      setUploadError('Por favor introduce un precio válido mayor a 0€.');
      return;
    }

    setIsSubmitting(true);

    const auctionEndsAt = listingType === 'auction'
      ? new Date(Date.now() + auctionDurationHours * 3600 * 1000).toISOString()
      : undefined;

    try {
      const success = await addGame({
        title: title.trim(),
        platform,
        condition,
        hasOriginalBox,
        hasManual,
        discCondition,
        price: listingType === 'direct' ? finalPrice : finalPrice,
        estimatedMarketPrice: Number(estimatedMarketPrice) || Math.round(finalPrice * 1.3),
        listingType,
        startingBid: listingType === 'auction' ? finalPrice : undefined,
        currentBid: listingType === 'auction' ? finalPrice : undefined,
        minBidIncrement: listingType === 'auction' ? minBidIncrement : undefined,
        auctionEndsAt,
        description: description.trim() || 'Videojuego en excelente estado, trato en mano garantizado.',
        images,
        city,
        neighborhood: neighborhood.trim() || 'Centro',
      });

      if (success) {
        onClose();
      } else {
        setUploadError('No se pudo guardar el anuncio. Por favor inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('Error al publicar anuncio:', err);
      setUploadError(err?.message || 'Error inesperado al publicar el anuncio online.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl my-auto max-h-[94vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Publicar Anuncio Online
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  En Vivo en Red
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Visible al instante en todos los ordenadores y dispositivos con trato presencial seguro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-zinc-100 dark:via-zinc-800 to-transparent p-3 rounded-xl border border-emerald-500/20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              ¿Quieres publicar más rápido?
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showPresets ? 'Ocultar Plantillas' : 'Elegir Plantilla de Juego Oficial'}</span>
          </button>
        </div>

        {/* Presets Drawer */}
        {showPresets && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Haz clic en cualquier juego para rellenar automáticamente todos los datos y fotos oficiales:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {GAME_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500 text-left transition-colors group"
                >
                  <img
                    src={preset.coverImage}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-500">
                      {preset.title}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {preset.platform} • {preset.price}€ ({preset.listingType === 'auction' ? 'Subasta' : 'Venta'})
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION 1: TÍTULO Y PLATAFORMA */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Tag className="w-3.5 h-3.5" />
              <span>1. Información del Videojuego</span>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Título del Juego / Edición *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Elden Ring (PS5), The Legend of Zelda Tears of the Kingdom (Switch), Halo Infinite (Xbox)..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Plataforma */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Plataforma / Consola
              </label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value as Platform)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CONSOLE_SECTIONS.map(sec => (
                  <optgroup key={sec.group} label={sec.group}>
                    {sec.platforms.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Modalidad de Venta: Directa o Subasta */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Modalidad del Anuncio
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setListingType('direct')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    listingType === 'direct'
                      ? 'bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-white ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-500" />
                      Venta Directa
                    </span>
                    {listingType === 'direct' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Precio cerrado. Trato en mano presencial.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('auction')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    listingType === 'auction'
                      ? 'bg-amber-500/10 border-amber-500 text-zinc-900 dark:text-white ring-1 ring-amber-500'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Gavel className="w-4 h-4 text-amber-500" />
                      Subasta en Vivo
                    </span>
                    {listingType === 'auction' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Pujas en tiempo real auditadas.
                  </p>
                </button>
              </div>

              {/* Precios según modalidad */}
              {listingType === 'direct' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Precio de Venta en Mano (€) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        className="w-full pl-3 pr-7 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-mono">
                        €
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Precio Oficial Tienda / Mercado (€)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={estimatedMarketPrice}
                        onChange={e => setEstimatedMarketPrice(Number(e.target.value))}
                        className="w-full pl-3 pr-7 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-sm focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-mono">
                        €
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Puja de Salida (€) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={startingBid}
                        onChange={e => setStartingBid(Number(e.target.value))}
                        className="w-full pl-3 pr-7 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold text-sm focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-mono">
                        €
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Incremento Mínimo (€)
                    </label>
                    <select
                      value={minBidIncrement}
                      onChange={e => setMinBidIncrement(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-mono"
                    >
                      <option value={1}>+1 € por puja</option>
                      <option value={2}>+2 € por puja</option>
                      <option value={5}>+5 € por puja</option>
                      <option value={10}>+10 € por puja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                      Duración de la Subasta
                    </label>
                    <select
                      value={auctionDurationHours}
                      onChange={e => setAuctionDurationHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                    >
                      <option value={6}>6 Horas (Express)</option>
                      <option value={12}>12 Horas</option>
                      <option value={24}>24 Horas (1 día)</option>
                      <option value={48}>48 Horas (2 días)</option>
                      <option value={72}>72 Horas (3 días)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Discount badge preview */}
              {discountPercent > 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 font-bold border border-emerald-500/20">
                    -{discountPercent}% de ahorro
                  </span>
                  <span>Este anuncio recibirá el badge de "Chollo Verificado".</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: ESTADO FÍSICO TRANSPARENTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. Estado Físico y Componentes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Estado General
                </label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm"
                >
                  {CONDITIONS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Estado del Soporte (Disco / Cartucho)
                </label>
                <select
                  value={discCondition}
                  onChange={e => setDiscCondition(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm"
                >
                  <option value="Cartucho Switch 2 Impecable">Cartucho Switch 2 Impecable</option>
                  <option value="Sin marcas">Disco Blu-ray sin marcas ni microrayas</option>
                  <option value="Microrayas superficiales">Microrayas muy superficiales (100% funcional)</option>
                  <option value="Excelente">Excelente / Precintado</option>
                  <option value="No aplica (Cartucho original)">Cartucho Retro Original Limpio</option>
                </select>
              </div>
            </div>

            {/* Checkboxes: Caja y Manual */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={hasOriginalBox}
                  onChange={e => setHasOriginalBox(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Incluye Caja / Estuche Original</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={hasManual}
                  onChange={e => setHasManual(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Incluye Manual / Folletos Interiores</span>
              </label>
            </div>
          </div>

          {/* SECTION 3: FOTOGRAFÍAS REALES CON COMPRESIÓN EN VIVO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Fotografías del Videojuego ({images.length})</span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Compresión automática ultra-ligera
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
              <UploadCloud className="w-7 h-7 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Arrastra tus fotos aquí o haz clic para seleccionarlas
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Fotos de móvil o cámara se optimizan al instante (PNG, JPG, WEBP). Sin límite de peso.
              </p>
            </div>

            {/* Status during compression */}
            {isProcessingImage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{imageProcessStatus}</span>
              </div>
            )}

            {/* Or Add by URL */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="O pega el enlace de una foto en internet (https://...)"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
                <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                Añadir URL
              </button>
            </div>

            {/* Images Grid Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group bg-zinc-950"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    
                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] shadow-sm">
                        Portada
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(index)}
                          className="p-1 rounded bg-zinc-800 text-white text-[10px] hover:bg-emerald-600"
                          title="Hacer portada principal"
                        >
                          Portada
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: UBICACIÓN Y DESCRIPCIÓN */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>4. Punto de Encuentro y Detalles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Ciudad
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Barrio o Punto Seguro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  placeholder="Ej. Centro / Estación / Sol"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Descripción para el Comprador
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Indica cualquier detalle relevante: precinto, si se puede probar, disponibilidad horaria para entrega..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Trust note */}
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Garantía LUDEX: El comprador nunca paga por adelantado; se verifica el juego y se realiza la entrega presencialmente.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImage}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publicando en la red...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Anuncio Ahora</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
