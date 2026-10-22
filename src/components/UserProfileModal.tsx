import React from 'react';
import { User } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  MapPin,
  Lock,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export const UserProfileModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const { reviews } = useApp();

  const userReviews = reviews.filter(r => r.targetUserId === user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {user.name}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  user.role === 'admin' || user.email?.toLowerCase() === 'davidtorrego1@gmail.com'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {user.role === 'admin' || user.email?.toLowerCase() === 'davidtorrego1@gmail.com'
                    ? '🛡️ Administrador Oficial'
                    : user.verificationLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{user.location}</span>
                <span>•</span>
                <span>Miembro desde {user.memberSince}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Checks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300">Identidad DNI Verificada</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300">Teléfono Confirmado</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2 col-span-2 sm:col-span-1">
            <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300">Clave E2EE Auditada</span>
          </div>
        </div>

        {/* Reputation Breakdown Metrics */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
              Índice de Confianza Presencial
            </h4>
            <span className="font-mono text-xl font-extrabold text-emerald-500">
              ★ {user.rating} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="block text-base font-bold font-mono text-zinc-900 dark:text-white">
                {user.punctualityScore}%
              </span>
              <span className="text-[11px] text-zinc-500">Puntualidad en cita</span>
            </div>
            <div>
              <span className="block text-base font-bold font-mono text-zinc-900 dark:text-white">
                {user.itemAccuracyScore}%
              </span>
              <span className="text-[11px] text-zinc-500">Fidelidad de estado</span>
            </div>
            <div>
              <span className="block text-base font-bold font-mono text-zinc-900 dark:text-white">
                {user.communicationScore}%
              </span>
              <span className="text-[11px] text-zinc-500">Claridad y trato</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-3">
            Reseñas de Compradores & Vendedores ({userReviews.length})
          </h4>

          <div className="space-y-3 max-h-56 overflow-y-auto">
            {userReviews.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3 text-center">
                Aún no hay reseñas registradas para este perfil.
              </p>
            ) : (
              userReviews.map(rev => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {rev.authorName}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-mono">
                        ({rev.dealType})
                      </span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    "{rev.comment}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span>Juego: {rev.gameTitle}</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            Cerrar Perfil
          </button>
        </div>

      </div>
    </div>
  );
};
