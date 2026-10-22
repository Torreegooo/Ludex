import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCircle2, ShieldCheck, DollarSign, X, MessageSquare, ArrowRight } from 'lucide-react';

export const PushNotificationToast: React.FC = () => {
  const { activeToast, dismissToast, setSelectedGameModal, games, setActiveTab, currentUser } = useApp();

  if (!activeToast) return null;

  // Only show if intended for current user or general broadcast
  if (!currentUser || (activeToast.recipientId !== currentUser.id && activeToast.recipientId !== 'all')) {
    return null;
  }

  const getIcon = () => {
    switch (activeToast.type) {
      case 'purchase_request':
        return <Bell className="w-5 h-5 text-amber-400" />;
      case 'purchase_accepted':
      case 'item_delivered':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'new_bid':
        return <DollarSign className="w-5 h-5 text-indigo-400" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleAction = () => {
    if (activeToast.actionPayload?.gameId) {
      const g = games.find(item => item.id === activeToast.actionPayload?.gameId);
      if (g) setSelectedGameModal(g);
    } else if (activeToast.actionPayload?.transactionId) {
      setActiveTab('history');
    } else if (activeToast.actionPayload?.conversationId) {
      setActiveTab('chats');
    }
    dismissToast();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="bg-zinc-900/95 dark:bg-zinc-900/95 border border-zinc-700/80 dark:border-zinc-700 text-zinc-100 shadow-2xl rounded-xl p-4 backdrop-blur-md flex items-start gap-3.5 ring-1 ring-white/10">
        <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-700/60 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Notificación Push
            </span>
            <button
              onClick={dismissToast}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-0.5 rounded"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-1">
            {activeToast.title}
          </h4>
          <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
            {activeToast.body}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <span>Ver detalles</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={dismissToast}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
