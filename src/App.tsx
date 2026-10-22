import React, { useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { FilterBar, CONSOLE_GROUPS } from './components/FilterBar';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { ChatModal } from './components/ChatModal';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { CreateListingModal } from './components/CreateListingModal';
import { SecurityGuideModal } from './components/SecurityGuideModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { SecondHandHeroSection } from './components/SecondHandHeroSection';
import { PushNotificationToast } from './components/PushNotificationToast';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SafePointsMapModal } from './components/SafePointsMapModal';
import {
  ShieldCheck,
  Gavel,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Lock,
  Handshake,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  UserPlus,
  ShoppingBag,
  MapPin,
  Heart
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    games,
    activeTab,
    setActiveTab,
    selectedFamily,
    setSelectedFamily,
    selectedPlatform,
    selectedCondition,
    listingTypeFilter,
    competitiveOnly,
    selectedCity,
    maxPrice,
    searchQuery,
    sortBy,
    selectedGameModal,
    setSelectedGameModal,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    selectedUserProfile,
    setSelectedUserProfile,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    currentUser,
    setAuthMode,
    setSelectedPlatform,
    bargainOnly,
    favoritesOnly,
    favorites,
    t,
    language,
  } = useApp();

  const isEn = language === 'en';

  // Filter and sort games
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        // Console Family Filter
        if (selectedFamily !== 'all') {
          const grp = CONSOLE_GROUPS.find(g => g.id === selectedFamily);
          if (grp && !grp.platforms.includes(game.platform as any)) {
            return false;
          }
        }

        // Specific Platform
        if (selectedPlatform !== 'Todas' && game.platform !== selectedPlatform) {
          return false;
        }

        // Condition
        if (selectedCondition !== 'Cualquier Estado' && game.condition !== selectedCondition) {
          return false;
        }

        // Listing type
        if (listingTypeFilter === 'direct' && game.listingType !== 'direct') {
          return false;
        }
        if (listingTypeFilter === 'auction' && game.listingType !== 'auction') {
          return false;
        }

        // Dedicated auctions tab
        if (activeTab === 'auctions' && game.listingType !== 'auction') {
          return false;
        }

        // Dedicated favorites tab or favorites-only filter
        if ((favoritesOnly || activeTab === 'favorites') && !favorites.includes(game.id)) {
          return false;
        }

        // City
        if (selectedCity !== 'Todas' && game.city !== selectedCity) {
          return false;
        }

        // Price
        const effectivePrice =
          game.listingType === 'auction'
            ? (game.currentBid || game.startingBid || 0)
            : game.price;

        if (effectivePrice > maxPrice) {
          return false;
        }

        // Competitive price
        if (competitiveOnly) {
          const discount = ((game.estimatedMarketPrice - effectivePrice) / game.estimatedMarketPrice) * 100;
          if (discount < 15) return false;
        }

        // Bargain filter (minimum 30% discount vs estimated market value)
        if (bargainOnly) {
          const discount = ((game.estimatedMarketPrice - effectivePrice) / game.estimatedMarketPrice) * 100;
          if (discount < 30) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (game.title || '').toLowerCase().includes(q);
          const matchPlatform = (game.platform || '').toLowerCase().includes(q);
          const matchCity = (game.city || '').toLowerCase().includes(q);
          const matchDesc = (game.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchPlatform && !matchCity && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.listingType === 'auction' ? (a.currentBid || a.startingBid || 0) : a.price;
        const priceB = b.listingType === 'auction' ? (b.currentBid || b.startingBid || 0) : b.price;

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'market_discount') {
          const discA = (a.estimatedMarketPrice - priceA) / a.estimatedMarketPrice;
          const discB = (b.estimatedMarketPrice - priceB) / b.estimatedMarketPrice;
          return discB - discA;
        }
        if (sortBy === 'auction_ending') {
          if (!a.auctionEndsAt) return 1;
          if (!b.auctionEndsAt) return -1;
          return new Date(a.auctionEndsAt).getTime() - new Date(b.auctionEndsAt).getTime();
        }
        // Relevance / default: show newest listings first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    games,
    selectedFamily,
    selectedPlatform,
    selectedCondition,
    listingTypeFilter,
    activeTab,
    selectedCity,
    maxPrice,
    competitiveOnly,
    bargainOnly,
    favoritesOnly,
    favorites,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors pb-20 md:pb-10">
      
      {/* Real-time Push Notification Toast */}
      <PushNotificationToast />

      {/* Main Top Header */}
      <Navbar />

      {/* Trust bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-white">LUDEX Oficial:</span>
            <span className="text-zinc-400">
              Pagos presenciales en mano tras comprobar el estado del disco o cartucho. Mensajería directa entre usuarios.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Perfil de Usuario</span>
              </button>
            ) : (
              <span className="text-zinc-400">
                Conectado como <strong className="text-white">{currentUser.name}</strong> ({currentUser.location})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* App Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full">
        
        {/* TAB 1: EXPLORE CATALOG */}
        {activeTab === 'explore' && (
          <div>
            {/* Second-Hand Marketplace Hero Section */}
            <SecondHandHeroSection />

            {/* Filter and Search Bar */}
            <FilterBar />

            {/* Results Status Line */}
            <div className="flex items-center justify-between mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                Mostrando <strong className="text-zinc-900 dark:text-white font-mono">{filteredGames.length}</strong> videojuegos listados
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Trato en mano con aprobación obligatoria</span>
              </span>
            </div>

            {/* Games Grid or Clean Empty State */}
            {filteredGames.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 sm:p-14 text-center text-zinc-500 space-y-4 max-w-xl mx-auto my-6 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-emerald-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {t('catalog_empty_title')}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
                    {t('catalog_empty_desc')}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {!currentUser ? (
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear mi Perfil</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Publicar Primer Videojuego</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE AUCTIONS */}
        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-zinc-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider mb-2">
                  <Gavel className="w-3.5 h-3.5" />
                  <span>{t('auctions_badge')}</span>
                </div>
                <h2 className="text-xl font-bold">
                  {t('auctions_title')}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 max-w-xl">
                  {t('auctions_subtitle')}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
              >
                {t('auctions_create_btn')}
              </button>
            </div>

            <FilterBar />

            {/* Filtered Auction Games Grid */}
            {filteredGames.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500 space-y-3">
                <Gavel className="w-12 h-12 mx-auto text-amber-500/60" />
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  {t('auctions_empty_title')}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {t('auctions_empty_desc')}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  {t('auctions_empty_btn')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CHATS */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                  {t('chats_title')}
                </h2>
                <p className="text-xs text-zinc-500">
                  {t('chats_subtitle')}
                </p>
              </div>
            </div>

            <ChatModal />
          </div>
        )}

        {/* TAB 5: TRANSACTION HISTORY & RECEIPTS */}
        {activeTab === 'history' && <TransactionHistoryView />}

        {/* TAB 6: FAVORITES / WISHLIST */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-zinc-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{t('fav_badge')} ({favorites.length})</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  {t('fav_title')}
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                  {t('fav_subtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  {t('fav_continue_btn')}
                </button>
              </div>
            </div>

            <FilterBar />

            {filteredGames.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 sm:p-14 text-center text-zinc-500 space-y-4 max-w-md mx-auto my-8 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {t('fav_empty_title')}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {t('fav_empty_desc')}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {t('fav_empty_btn')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <SafePointsMapModal />
      {selectedGameModal && (
        <GameDetailModal
          game={selectedGameModal}
          onClose={() => setSelectedGameModal(null)}
        />
      )}

      {isCreateModalOpen && (
        <CreateListingModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {isSecurityModalOpen && (
        <SecurityGuideModal onClose={() => setIsSecurityModalOpen(false)} />
      )}

      {isAdminModalOpen && (
        <AdminDashboardModal onClose={() => setIsAdminModalOpen(false)} />
      )}

      {selectedUserProfile && (
        <UserProfileModal
          user={selectedUserProfile}
          onClose={() => setSelectedUserProfile(null)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
