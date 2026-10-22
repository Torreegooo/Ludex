import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Gavel, PlusCircle, MessageSquare, ShieldCheck, ShieldAlert } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCreateModalOpen,
    setIsAdminModalOpen,
    conversations,
    currentUser,
    transactions,
    t,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'davidtorrego1@gmail.com';

  // Unread messages for current user
  const unreadMessagesCount = currentUser
    ? conversations.reduce((acc, conv) => {
        if (currentUser.id === conv.buyerId) return acc + conv.unreadCountForBuyer;
        if (currentUser.id === conv.sellerId) return acc + conv.unreadCountForSeller;
        return acc;
      }, 0)
    : 0;

  // Pending transactions needing user attention
  const pendingTransactionsCount = currentUser
    ? transactions.filter(
        t => (t.sellerId === currentUser.id && t.status === 'solicitado') ||
             (t.buyerId === currentUser.id && t.status === 'aceptado_vendedor')
      ).length
    : 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-lg pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* Explorar */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'explore'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t('nav_catalog')}</span>
        </button>

        {/* Subastas */}
        <button
          onClick={() => setActiveTab('auctions')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'auctions'
              ? 'text-amber-500 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Gavel className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <span className="text-[10px] tracking-tight">{t('nav_auctions')}</span>
        </button>

        {/* Publicar Central Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center justify-center py-1 text-emerald-600 dark:text-emerald-400 group active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-4 ring-white dark:ring-zinc-950">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{t('nav_sell')}</span>
        </button>

        {/* Chats */}
        <button
          onClick={() => setActiveTab('chats')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'chats'
              ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-cyan-500 text-black text-[9px] font-bold">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t('nav_messages')}</span>
        </button>

        {/* Tratos & Historial */}
        <button
          onClick={() => setActiveTab('history')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            {pendingTransactionsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-emerald-500 text-black text-[9px] font-bold animate-pulse">
                {pendingTransactionsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t('nav_history')}</span>
        </button>

      </div>

      {/* Floating Admin Button on Mobile */}
      {isAdmin && (
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-3.5 py-2 rounded-full bg-purple-600 text-white font-bold text-xs shadow-xl flex items-center gap-1.5 border border-purple-400/40 active:scale-95 transition-transform"
          >
            <ShieldAlert className="w-4 h-4 text-purple-200" />
            <span>Admin</span>
          </button>
        </div>
      )}
    </nav>
  );
};
