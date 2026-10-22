import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { SAFE_MEETUP_POINTS } from '../data/mockData';
import { SafeMeetupPoint } from '../types';
import {
  MapPin,
  ShieldCheck,
  Building2,
  Coffee,
  X,
  Navigation,
  Check,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';

export const SafePointsMapModal: React.FC = () => {
  const { isSafePointsMapOpen, setIsSafePointsMapOpen, t, language } = useApp();
  const isEn = language === 'en';
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [selectedPoint, setSelectedPoint] = useState<SafeMeetupPoint>(SAFE_MEETUP_POINTS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const filteredPoints = selectedCity === 'Todas'
    ? SAFE_MEETUP_POINTS
    : SAFE_MEETUP_POINTS.filter(p => p.city === selectedCity);

  const cities = ['Todas', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza'];

  useEffect(() => {
    if (!isSafePointsMapOpen) return;

    // Small delay to ensure modal container has dimensions in DOM
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Initialize Leaflet Map
        const map = L.map(mapContainerRef.current).setView([40.4168, -3.7038], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Custom marker icon creation with safety colors
      const createIcon = (type: SafeMeetupPoint['type'], isSelected: boolean) => {
        const bgClass = isSelected
          ? '#10b981'
          : type === 'Comisaría / Estación'
          ? '#3b82f6'
          : type === 'Centro Comercial Vigilado'
          ? '#8b5cf6'
          : '#f59e0b';

        return L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            background-color: ${bgClass};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '14px' : '11px'};
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
          ">📍</div>`,
          iconSize: isSelected ? [32, 32] : [26, 26],
          iconAnchor: isSelected ? [16, 16] : [13, 13],
        });
      };

      // Add markers for filtered points
      filteredPoints.forEach(point => {
        const isCurrent = selectedPoint.id === point.id;
        const marker = L.marker([point.lat, point.lng], {
          icon: createIcon(point.type, isCurrent),
        }).addTo(map);

        marker.on('click', () => {
          setSelectedPoint(point);
          map.setView([point.lat, point.lng], 14, { animate: true });
        });

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <strong style="display:block; margin-bottom: 2px;">${point.name}</strong>
            <span style="color: #6b7280; font-size: 11px;">${point.address}</span>
            <div style="margin-top: 6px; font-weight: bold; color: #10b981;">🛡️ Zona Vigilada Verificada</div>
          </div>
        `);

        markersRef.current.push(marker);
      });

      // Fit bounds if multiple points, else center on selected
      if (filteredPoints.length > 1) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      } else if (filteredPoints.length === 1) {
        map.setView([filteredPoints[0].lat, filteredPoints[0].lng], 13);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [isSafePointsMapOpen, selectedCity, selectedPoint.id]);

  // Cleanup on modal unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isSafePointsMapOpen) return null;

  const handleCopyAddress = (point: SafeMeetupPoint) => {
    navigator.clipboard.writeText(`${point.name} - ${point.address}, ${point.city}`);
    setCopiedId(point.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{t('map_modal_title')}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  {t('map_modal_verified')}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t('map_modal_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSafePointsMapOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1 shrink-0">
            {t('map_city_label')}
          </span>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`text-xs px-3 py-1 rounded-lg shrink-0 font-bold transition-all ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {city === 'Todas' ? (isEn ? 'All' : 'Todas') : city}
            </button>
          ))}
        </div>

        {/* Modal Main Content: Map + Side List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[420px] overflow-hidden">
          
          {/* Leaflet Map Container */}
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-full relative min-h-[300px]">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            <div className="absolute bottom-3 left-3 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] space-y-1 shadow-md">
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>{t('map_legend_police')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>{t('map_legend_mall')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>{t('map_legend_cafe')}</span>
              </div>
            </div>
          </div>

          {/* Side List & Selected Point Detail */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden bg-zinc-50/60 dark:bg-zinc-950/40">
            
            {/* Selected Card Spotlight */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {selectedPoint.city} • {selectedPoint.type}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white mt-1">
                    {selectedPoint.name}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-md">
                  <span>★</span>
                  <span>{selectedPoint.safetyRating}.0</span>
                </div>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{selectedPoint.address}</span>
              </p>

              {selectedPoint.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  {selectedPoint.description}
                </p>
              )}

              {/* Security features tag list */}
              {selectedPoint.securityFeatures && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedPoint.securityFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyAddress(selectedPoint)}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedId === selectedPoint.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t('map_copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('map_copy_btn')}</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPoint.name}, ${selectedPoint.address}, ${selectedPoint.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                  title={t('map_open_gmaps')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Scrollable list of points */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60 dark:divide-zinc-800/60 p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 block">
                {t('map_available_points')} ({filteredPoints.length}):
              </span>
              {filteredPoints.map(p => {
                const isSelected = selectedPoint.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPoint(p);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([p.lat, p.lng], 14, { animate: true });
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 my-1 ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 shadow-xs'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-zinc-900 dark:text-white truncate">
                          {p.name}
                        </strong>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {p.city}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {p.address}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
