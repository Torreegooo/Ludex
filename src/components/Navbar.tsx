import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  Bell,
  Moon,
  Sun,
  PlusCircle,
  Gavel,
  MessageSquare,
  FileText,
  UserPlus,
  LogIn,
  LogOut,
  User,
  Sparkles,
  ChevronDown,
  Search,
  Check,
  MapPin,
  Database,
  Heart,
  Navigation,
  Globe
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logoutUser,
    setIsAuthModalOpen,
    setAuthMode,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    clearAllNotifications,
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    setIsCreateModalOpen,
    setIsSecurityModalOpen,
    setIsAdminModalOpen,
    searchQuery,
    setSearchQuery,
    requestPushPermission,
    pushPermission,
    setSelectedPlatform,
    setSelectedUserProfile,
    favorites,
    isCloudSynced,
    setIsSafePointsMapOpen,
    language,
    toggleLanguage,
    t,
  } = useApp();

  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'davidtorrego1@gmail.com';

  const userNotifications = currentUser
    ? notifications.filter(n => n.recipientId === currentUser.id)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedPlatform('Todas');
                setActiveTab('explore');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shadow-sm group-hover:border-emerald-500 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono">
                  LUDEX
                  <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Trato Seguro
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase font-sans font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20" title="Base de datos en la nube conectada">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud BD
                  </span>
                </span>
                <span className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Mercado Seguro de Videojuegos
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'explore'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {t('nav_catalog')}
              </button>

              <button
                onClick={() => setActiveTab('auctions')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'auctions'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Gavel className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('nav_auctions')}</span>
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'chats'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                <span>{t('nav_messages')}</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>{t('nav_history')}</span>
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'favorites'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-rose-500 fill-current' : 'text-zinc-400'}`} />
                <span>{t('nav_favorites')}</span>
                {favorites.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Tools & Search */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsSafePointsMapOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              title="Mapa de puntos seguros de encuentro"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('nav_safe_points')}</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={t('nav_search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Dashboard Quick Button */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                title="Abrir Panel Central de Administración LUDEX"
              >
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>
            )}

            {/* User Profile or Register / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isAdmin
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className={`w-6 h-6 rounded-full object-cover ring-1 ${isAdmin ? 'ring-purple-500' : 'ring-emerald-500'}`}
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="font-semibold leading-tight flex items-center gap-1">
                      {currentUser.name}
                      {isAdmin && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-400 font-bold uppercase">
                          Admin
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {currentUser.verificationLevel}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-zinc-900 dark:text-white">
                          {currentUser.name}
                        </p>
                        {isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-mono mt-1">
                        {currentUser.publicKeyFingerprint}
                      </p>
                    </div>

                    {/* Profile Menu Actions */}
                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsAdminModalOpen(true);
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                          <span>Panel Central de Administración</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedUserProfile(currentUser);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Ver Mi Perfil de Confianza</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('history');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Mis Tratos y Recibos</span>
                      </button>

                      <button
                        onClick={() => {
                          logoutUser();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Perfil</span>
                </button>
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Notificaciones push"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Notificaciones Push
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Avisos de subastas, solicitudes y aprobaciones
                      </p>
                    </div>
                    {userNotifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-emerald-500 hover:underline"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {userNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-zinc-500">
                        No tienes notificaciones pendientes.
                      </div>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.type === 'purchase_request' || n.type === 'purchase_accepted') {
                              setActiveTab('history');
                            } else if (n.type === 'message') {
                              setActiveTab('chats');
                            }
                            setIsNotifMenuOpen(false);
                          }}
                          className={`p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                            {n.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono tracking-wider font-extrabold">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                isDarkMode
                  ? 'border-zinc-800 bg-zinc-900 text-amber-400 hover:bg-zinc-800 shadow-sm'
                  : 'border-zinc-300 bg-zinc-100 text-indigo-600 hover:bg-zinc-200 shadow-sm'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar tema claro y oscuro"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Security Protocol Trigger */}
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protocolo</span>
            </button>

            {/* Publish Game Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">{t('nav_sell')}</span>
              <span className="xs:hidden">{t('nav_sell')}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
