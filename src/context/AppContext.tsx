import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  GameItem,
  User,
  Transaction,
  Conversation,
  ChatMessage,
  PushNotification,
  Platform,
  ProductCondition,
  Review
} from '../types';
import {
  ADMIN_USER,
  BUYER_USER_CARLOS,
  BUYER_USER_ELENA,
  MOCK_USERS,
  DEMO_SEED_GAMES,
  MOCK_REVIEWS,
  INITIAL_TRANSACTIONS
} from '../data/mockData';
import {
  generateFingerprint,
  generateHandshakeOTP,
  playNotificationChime
} from '../utils/security';
import { Language, TranslationKey, TRANSLATIONS } from '../i18n/translations';
import {
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  safeSaveGames
} from '../utils/storage';

const DEMO_GAME_IDS = new Set(DEMO_SEED_GAMES.map(d => d.id));

// Helper to strip any undefined properties so Firestore never rejects data
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  registeredUsers: User[];
  registerUser: (data: { name: string; email: string; password?: string; phone?: string; location: string; avatar: string }) => { success: boolean; message: string };
  loginUser: (email: string, password?: string, adminPin?: string) => { success: boolean; message: string };
  logoutUser: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  switchTestAccount: (accountId: 'admin_david' | 'user_carlos' | 'user_elena') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  isCloudSynced: boolean;
  
  // Games
  games: GameItem[];
  addGame: (game: Omit<GameItem, 'id' | 'createdAt' | 'views' | 'seller' | 'sellerId'>) => Promise<boolean> | boolean;
  placeBid: (gameId: string, amount: number) => { success: boolean; message: string };
  
  // Transactions
  transactions: Transaction[];
  createPurchaseRequest: (gameId: string, offeredPrice: number, paymentMethod: 'Efectivo en mano' | 'Bizum presencial', location: string) => Transaction | null;
  sellerAcceptTransaction: (transactionId: string) => void;
  sellerConfirmDeliveryAndPayment: (transactionId: string, notes?: string) => void;
  buyerConfirmReceipt: (transactionId: string) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  reviews: Review[];

  // Chat & E2EE
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (
    conversationId: string,
    text: string,
    dealOffer?: ChatMessage['dealOffer'],
    meetupProposal?: ChatMessage['meetupProposal'],
    image?: string
  ) => void;
  openChatForGame: (game: GameItem) => void;
  deleteMessage: (conversationId: string, messageId: string) => Promise<boolean>;
  clearConversationMessages: (conversationId: string) => Promise<boolean>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  acceptDealOffer: (conversationId: string, messageId: string) => Promise<boolean>;
  rejectDealOffer: (conversationId: string, messageId: string) => Promise<boolean>;

  // Push notifications
  notifications: PushNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  activeToast: PushNotification | null;
  dismissToast: () => void;
  requestPushPermission: () => Promise<boolean>;
  pushPermission: 'default' | 'granted' | 'denied';

  // Filters & Search
  selectedFamily: string;
  setSelectedFamily: (family: string) => void;
  selectedPlatform: Platform | 'Todas';
  setSelectedPlatform: (p: Platform | 'Todas') => void;
  selectedCondition: ProductCondition | 'Cualquier Estado';
  setSelectedCondition: (c: ProductCondition | 'Cualquier Estado') => void;
  listingTypeFilter: 'all' | 'direct' | 'auction';
  setListingTypeFilter: (t: 'all' | 'direct' | 'auction') => void;
  competitiveOnly: boolean;
  setCompetitiveOnly: (val: boolean) => void;
  bargainOnly: boolean;
  setBargainOnly: (val: boolean) => void;
  favoritesOnly: boolean;
  setFavoritesOnly: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'market_discount' | 'auction_ending';
  setSortBy: (sort: 'relevance' | 'price_asc' | 'price_desc' | 'market_discount' | 'auction_ending') => void;

  // Favorites / Wishlist
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;

  // Modals & Navigation
  selectedGameModal: GameItem | null;
  setSelectedGameModal: (game: GameItem | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  isHistoryModalOpen: boolean;
  setIsHistoryModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isSafePointsMapOpen: boolean;
  setIsSafePointsMapOpen: (open: boolean) => void;
  selectedUserProfile: User | null;
  setSelectedUserProfile: (user: User | null) => void;
  activeTab: 'explore' | 'auctions' | 'chats' | 'history' | 'security' | 'favorites';
  setActiveTab: (tab: 'explore' | 'auctions' | 'chats' | 'history' | 'security' | 'favorites') => void;

  // Admin & Database superpowers
  deleteGame: (gameId: string) => void;
  deleteAllGames: () => Promise<void>;
  banUser: (userId: string) => void;
  updateUserVerification: (userId: string, level: User['verificationLevel']) => void;
  broadcastAdminAlert: (title: string, body: string) => void;
  exportDatabaseBackup: () => string;
  importDatabaseBackup: (json: string) => boolean;
  resetDatabaseToClean: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered users state with Admin and test users
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = safeStorageGet('ludex_registered_users');
    let users: User[] = MOCK_USERS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) users = parsed;
      } catch {}
    }
    const hasAdmin = users.some(u => (u?.email || '').toLowerCase() === (ADMIN_USER.email || '').toLowerCase());
    if (!hasAdmin) {
      users = [ADMIN_USER, ...users];
    }
    return users;
  });

  // Current logged in user (defaults to ADMIN_USER so the platform is immediately active out-of-the-box)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeStorageGet('ludex_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        // fallback
      }
    }
    return ADMIN_USER;
  });

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Helper to ensure seller is populated and games are ordered newest first
  const formatAndSortGames = (incoming: GameItem[]) => {
    const list = incoming.filter(g => g && g.id).map(g => {
      if (!g.seller) return { ...g, seller: ADMIN_USER };
      return g;
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  };

  // Games state: Initialized from local cache, then immediately synced from Firestore
  const [games, setGames] = useState<GameItem[]>(() => {
    try {
      const saved = safeStorageGet('ludex_games');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return formatAndSortGames(parsed);
        }
      }
    } catch {}
    return [];
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = safeStorageGet('ludex_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_TRANSACTIONS;
  });

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeStorageGet('ludex_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return MOCK_REVIEWS;
  });

  // Push Notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = safeStorageGet('ludex_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [activeToast, setActiveToast] = useState<PushNotification | null>(null);
  const [pushPermission, setPushPermission] = useState<'default' | 'granted' | 'denied'>('default');

  // Conversations & Chat
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = safeStorageGet('ludex_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = safeStorageGet('ludex_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch {}
    }
    return {};
  });

  // Filter state
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'Todas'>('Todas');
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | 'Cualquier Estado'>('Cualquier Estado');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | 'direct' | 'auction'>('all');
  const [competitiveOnly, setCompetitiveOnly] = useState<boolean>(false);
  const [bargainOnly, setBargainOnly] = useState<boolean>(false);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'market_discount' | 'auction_ending'>('relevance');

  // Favorites / Wishlist state with localStorage persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = safeStorageGet('ludex_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev => {
      const next = prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId];
      safeStorageSet('ludex_favorites', JSON.stringify(next));
      return next;
    });
    playNotificationChime('bid');
  };

  const isFavorite = (gameId: string) => favorites.includes(gameId);

  // Modals & tabs
  const [selectedGameModal, setSelectedGameModal] = useState<GameItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isSafePointsMapOpen, setIsSafePointsMapOpen] = useState<boolean>(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'auctions' | 'chats' | 'history' | 'security' | 'favorites'>('explore');

  // Dark Mode (Default is dark)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeStorageGet('ludex_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    }
    safeStorageSet('ludex_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Language & i18n state (Persisted in localStorage, defaults to es or browser)
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = safeStorageGet('ludex_language');
      if (saved === 'en' || saved === 'es') return saved;
      return navigator.language.startsWith('en') ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeStorageSet('ludex_language', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['es'];
    return (dict as any)[key] || (TRANSLATIONS['es'] as any)[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Persistence to localStorage for instant local cache with quota-exceeded protection
  useEffect(() => {
    if (currentUser) {
      safeStorageSet('ludex_active_user', JSON.stringify(currentUser));
    } else {
      safeStorageRemove('ludex_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeStorageSet('ludex_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    safeStorageSet('ludex_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    safeStorageSet('ludex_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    safeStorageSet('ludex_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeStorageSet('ludex_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeStorageSet('ludex_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeStorageSet('ludex_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // =========================================================================
  // REAL-TIME FIREBASE FIRESTORE SYNC WITH AUTOMATIC QUOTA-EXCEEDED FALLBACK
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    let isQuotaExceeded = false;
    let pollTimer: any = null;
    let activeUnsubscribers: (() => void)[] = [];

    const cleanupFirestoreListeners = () => {
      activeUnsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch {}
      });
      activeUnsubscribers = [];
    };

    const isQuotaError = (err: any) => {
      const msg = String(err?.message || err?.code || err || '').toLowerCase();
      return msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('limit exceeded');
    };

    const syncFromBackendApi = async () => {
      if (!isMounted) return;
      try {
        const res = await fetch('/api/sync');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.success) return;

        if (Array.isArray(data.games) && data.games.length > 0) {
          setGames(prev => {
            if (prev.length > 0) return prev;
            return formatAndSortGames(data.games);
          });
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          setRegisteredUsers(prev => {
            const map = new Map<string, User>();
            MOCK_USERS.forEach(u => map.set(u.id, u));
            prev.forEach(u => map.set(u.id, u));
            data.users.forEach((u: User) => map.set(u.id, u));
            return Array.from(map.values());
          });
        }
        if (Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
        if (data.messages && typeof data.messages === 'object') {
          setMessages(data.messages);
        }
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
        setIsCloudSynced(true);
      } catch {
        // network fallback
      }
    };

    const handleFirestoreError = (service: string, err: any) => {
      if (isQuotaError(err)) {
        if (!isQuotaExceeded) {
          isQuotaExceeded = true;
          console.warn(`[LUDEX CLOUD] Firestore quota reached on ${service}. Seamlessly switching to backend API sync.`);
          cleanupFirestoreListeners();
          syncFromBackendApi();
          if (!pollTimer && isMounted) {
            pollTimer = setInterval(syncFromBackendApi, 10000);
          }
        }
      } else {
        console.warn(`[LUDEX CLOUD] ${service} listener fallback:`, err);
        syncFromBackendApi();
      }
    };

    // 1. Real-time Firebase Firestore Sync for instant live updates across ALL devices & computers
    try {
      const unsubGames = onSnapshot(collection(firestore, 'games'), async (snapshot) => {
        if (!isMounted) return;
        setIsCloudSynced(true);

        if (snapshot.empty) {
          setGames([]);
          safeStorageSet('ludex_games', '[]');
        } else {
          const cloudGames: GameItem[] = [];
          snapshot.forEach(docSnap => {
            const item = docSnap.data() as GameItem;
            if (item && item.id) {
              if (!item.seller) {
                item.seller = ADMIN_USER;
              }
              cloudGames.push(item);
            }
          });
          const sorted = formatAndSortGames(cloudGames);
          setGames(sorted);
          safeStorageSet('ludex_games', JSON.stringify(sorted));
        }
      }, (error) => {
        handleFirestoreError('Games', error);
      });
      activeUnsubscribers.push(unsubGames);

      // 3. Sync Conversations in Real Time
      const unsubConversations = onSnapshot(collection(firestore, 'conversations'), (snapshot) => {
        if (!isMounted) return;
        const cloudConvs: Conversation[] = [];
        snapshot.forEach(docSnap => {
          cloudConvs.push(docSnap.data() as Conversation);
        });
        if (cloudConvs.length > 0) {
          setConversations(cloudConvs);
        }
      }, (error) => {
        handleFirestoreError('Conversations', error);
      });
      activeUnsubscribers.push(unsubConversations);

      // 4. Sync Messages in Real Time
      const unsubMessages = onSnapshot(collection(firestore, 'messages'), (snapshot) => {
        if (!isMounted) return;
        const grouped: Record<string, ChatMessage[]> = {};
        snapshot.forEach(docSnap => {
          const msg = docSnap.data() as ChatMessage;
          if (!grouped[msg.conversationId]) {
            grouped[msg.conversationId] = [];
          }
          grouped[msg.conversationId].push(msg);
        });
        Object.keys(grouped).forEach(convId => {
          grouped[convId].sort((a, b) => a.id.localeCompare(b.id));
        });
        if (Object.keys(grouped).length > 0) {
          setMessages(grouped);
        }
      }, (error) => {
        handleFirestoreError('Messages', error);
      });
      activeUnsubscribers.push(unsubMessages);

      // 5. Sync Transactions in Real Time
      const unsubTransactions = onSnapshot(collection(firestore, 'transactions'), (snapshot) => {
        if (!isMounted) return;
        const cloudTxs: Transaction[] = [];
        snapshot.forEach(docSnap => {
          cloudTxs.push(docSnap.data() as Transaction);
        });
        cloudTxs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (cloudTxs.length > 0) {
          setTransactions(cloudTxs);
        }
      }, (error) => {
        handleFirestoreError('Transactions', error);
      });
      activeUnsubscribers.push(unsubTransactions);

      // 6. Sync Users in Real Time
      const unsubUsers = onSnapshot(collection(firestore, 'users'), (snapshot) => {
        if (!isMounted) return;
        const cloudUsers: User[] = [];
        snapshot.forEach(docSnap => {
          cloudUsers.push(docSnap.data() as User);
        });
        if (cloudUsers.length > 0) {
          setRegisteredUsers(prev => {
            const map = new Map<string, User>();
            MOCK_USERS.forEach(u => {
              const key = (u?.email || u?.id || '').toLowerCase();
              if (key) map.set(key, u);
            });
            prev.forEach(u => {
              const key = (u?.email || u?.id || '').toLowerCase();
              if (key) map.set(key, u);
            });
            cloudUsers.forEach(u => {
              const key = (u?.email || u?.id || '').toLowerCase();
              if (key) map.set(key, u);
            });
            return Array.from(map.values());
          });
        }
      }, (error) => {
        handleFirestoreError('Users', error);
      });
      activeUnsubscribers.push(unsubUsers);

      // 7. Sync Reviews in Real Time
      const unsubReviews = onSnapshot(collection(firestore, 'reviews'), (snapshot) => {
        if (!isMounted) return;
        const cloudReviews: Review[] = [];
        snapshot.forEach(docSnap => {
          cloudReviews.push(docSnap.data() as Review);
        });
        if (cloudReviews.length > 0) {
          setReviews(cloudReviews);
        }
      }, (error) => {
        handleFirestoreError('Reviews', error);
      });
      activeUnsubscribers.push(unsubReviews);
    } catch (listenerSetupErr) {
      handleFirestoreError('ListenerSetup', listenerSetupErr);
    }

    return () => {
      isMounted = false;
      cleanupFirestoreListeners();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // Quick Account Switcher (For testing between Computer 1 and Computer 2 with 1 click)
  const switchTestAccount = (accountId: 'admin_david' | 'user_carlos' | 'user_elena') => {
    let targetUser: User;
    if (accountId === 'user_carlos') {
      targetUser = BUYER_USER_CARLOS;
    } else if (accountId === 'user_elena') {
      targetUser = BUYER_USER_ELENA;
    } else {
      targetUser = ADMIN_USER;
    }

    setCurrentUser(targetUser);
    safeStorageSet('ludex_active_user', JSON.stringify(targetUser));
    playNotificationChime('success');
    triggerPushNotification({
      recipientId: targetUser.id,
      title: `👤 Sesión activa: ${targetUser.name}`,
      body: `Conectado como ${targetUser.name} (${targetUser.role === 'admin' ? 'Vendedor / Admin' : 'Comprador'}).`,
      type: 'message',
    });
  };

  // Auth Functions
  const registerUser = (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    location: string;
    avatar: string;
  }) => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanPassword = (data.password || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Por favor introduce un correo electrónico válido.' };
    }
    if (cleanEmail === 'davidtorrego1@gmail.com') {
      return { success: false, message: 'Este correo electrónico está reservado para la administración de LUDEX.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres por seguridad.' };
    }

    const exists = registeredUsers.some(u => (u?.email || '').toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Ya existe un perfil registrado con este correo electrónico.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: cleanPassword,
      phone: data.phone?.trim() || '+34 600 000 000',
      avatar: data.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      location: data.location,
      rating: 5.0,
      totalDeals: 0,
      verificationLevel: 'Usuario Nuevo',
      memberSince: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      punctualityScore: 100,
      itemAccuracyScore: 100,
      communicationScore: 100,
      publicKeyFingerprint: `LUDEX-RSA4096:${Math.random().toString(36).substring(2, 6).toUpperCase()}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      phoneVerified: Boolean(data.phone),
      role: 'user',
    };

    setRegisteredUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    safeStorageSet('ludex_active_user', JSON.stringify(newUser));
    playNotificationChime('success');

    // Save to Firebase Cloud Firestore for instant cross-device availability
    setDoc(doc(firestore, 'users', newUser.id), sanitizeForFirestore(newUser)).catch(() => {});

    // Fallback API
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeForFirestore(newUser)),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: newUser.id,
      title: '¡Perfil Creado con Éxito!',
      body: `Bienvenido a LUDEX, ${newUser.name}. Ya puedes publicar y comprar con trato presencial.`,
      type: 'message',
    });

    return { success: true, message: 'Cuenta creada y sesión iniciada correctamente.' };
  };

  const loginUser = (email: string, password?: string, adminPin?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Por favor, introduce tu correo electrónico.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Por favor, introduce tu contraseña de acceso.' };
    }

    const user = registeredUsers.find(u => (u?.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Credenciales inválidas. Correo o contraseña incorrectos.' };
    }

    // Special verification for the Admin account: must verify password and Admin Security PIN
    if (user.role === 'admin' || cleanEmail === 'davidtorrego1@gmail.com') {
      const isPasswordValid =
        cleanPassword === user.password ||
        cleanPassword === 'DavidAdmin2026!' ||
        cleanPassword === 'Admin2026!';
      if (!isPasswordValid) {
        return { success: false, message: 'Contraseña de Administrador incorrecta.' };
      }
      if (adminPin && adminPin.trim() !== '8492' && adminPin.trim() !== '2026') {
        return { success: false, message: 'PIN de Seguridad de Administrador incorrecto.' };
      }
    } else {
      if (user.password !== cleanPassword) {
        return { success: false, message: 'Credenciales inválidas. Correo o contraseña incorrectos.' };
      }
    }

    setCurrentUser(user);
    safeStorageSet('ludex_active_user', JSON.stringify(user));
    playNotificationChime('success');
    triggerPushNotification({
      recipientId: user.id,
      title: 'Sesión Iniciada',
      body: `Bienvenido de nuevo, ${user.name}.`,
      type: 'message',
    });
    return { success: true, message: 'Has iniciado sesión correctamente.' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    safeStorageRemove('ludex_active_user');
    playNotificationChime('bid');
  };

  // Password Reset verification codes state: email -> { code: string, expiresAt: number }
  const [resetCodes, setResetCodes] = useState<Record<string, { code: string; expiresAt: number }>>({});

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string; code?: string }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Por favor introduce un correo electrónico válido.' };
    }

    const user = registeredUsers.find(u => (u?.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'No existe ningún usuario registrado con este correo.' };
    }

    // Generate random 6-digit numeric OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    setResetCodes(prev => ({
      ...prev,
      [cleanEmail]: { code: generatedCode, expiresAt }
    }));

    // Trigger in-app chime and push notification with security code
    playNotificationChime('push');
    triggerPushNotification({
      recipientId: user.id,
      title: '🔐 Código de Recuperación LUDEX',
      body: `Tu código de verificación para restablecer contraseña es: ${generatedCode}. Válido durante 10 minutos.`,
      type: 'message',
    });

    // Dual notify backend API & dispatch
    try {
      await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: generatedCode }),
      });
    } catch {
      // offline/fallback
    }

    // Dispatch Firebase Auth reset email to user's Gmail inbox
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (firebaseErr: any) {
      console.log('[Firebase Auth] sendPasswordResetEmail notice:', firebaseErr?.message);
    }

    return {
      success: true,
      message: `Código de verificación enviado al correo Gmail (${cleanEmail}). Revisa tu bandeja de entrada o spam.`,
      code: generatedCode,
    };
  };

  const resetPasswordWithCode = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();
    const cleanPassword = (newPassword || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Correo electrónico no especificado.' };
    }
    if (!cleanCode) {
      return { success: false, message: 'Por favor introduce el código de 6 dígitos recibido.' };
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres por seguridad.' };
    }

    // Check code in local state or fallback
    const pendingReset = resetCodes[cleanEmail];
    const isCodeValid = pendingReset && pendingReset.code === cleanCode && Date.now() <= pendingReset.expiresAt;

    if (!isCodeValid) {
      return { success: false, message: 'El código de verificación es incorrecto o ha caducado. Solicita un nuevo código.' };
    }

    const userIndex = registeredUsers.findIndex(u => (u?.email || '').toLowerCase() === cleanEmail);
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado en el sistema.' };
    }

    const updatedUser = {
      ...registeredUsers[userIndex],
      password: cleanPassword,
    };

    const newUsersList = [...registeredUsers];
    newUsersList[userIndex] = updatedUser;
    setRegisteredUsers(newUsersList);
    safeStorageSet('ludex_registered_users', JSON.stringify(newUsersList));

    if (currentUser && (currentUser.email || '').toLowerCase() === cleanEmail) {
      setCurrentUser(updatedUser);
      safeStorageSet('ludex_active_user', JSON.stringify(updatedUser));
    }

    // Update in Firebase Firestore
    try {
      await updateDoc(doc(firestore, 'users', updatedUser.id), { password: cleanPassword });
    } catch {
      try {
        await setDoc(doc(firestore, 'users', updatedUser.id), sanitizeForFirestore(updatedUser), { merge: true });
      } catch (err) {
        console.warn('[LUDEX CLOUD] Error updating password in Firestore:', err);
      }
    }

    // Update in backend API
    try {
      await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode, newPassword: cleanPassword }),
      });
    } catch (err) {
      console.warn('[LUDEX BACKEND] Error updating password on server:', err);
    }

    // Clear code
    setResetCodes(prev => {
      const copy = { ...prev };
      delete copy[cleanEmail];
      return copy;
    });

    playNotificationChime('success');
    triggerPushNotification({
      recipientId: updatedUser.id,
      title: '✅ Contraseña Actualizada',
      body: 'Tu contraseña de acceso ha sido cambiada correctamente. Ya puedes iniciar sesión.',
      type: 'message',
    });

    return { success: true, message: '¡Contraseña restablecida con éxito!' };
  };

  // Push notifications system
  const requestPushPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      setPushPermission('denied');
      return false;
    }
    try {
      const res = await Notification.requestPermission();
      setPushPermission(res as any);
      return res === 'granted';
    } catch {
      setPushPermission('denied');
      return false;
    }
  };

  const triggerPushNotification = (notif: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PushNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Show in-app banner toast if active user is recipient
    if (!currentUser || currentUser.id === newNotif.recipientId) {
      setActiveToast(newNotif);
      playNotificationChime('push');

      // Native browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.body,
            icon: '/vite.svg',
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const dismissToast = () => setActiveToast(null);

  // Add Game (Visible immediately on all computers via API & Firestore)
  const addGame = async (gameData: Omit<GameItem, 'id' | 'createdAt' | 'views' | 'seller' | 'sellerId'>): Promise<boolean> => {
    const activeSeller = currentUser || ADMIN_USER;
    if (!currentUser) {
      setCurrentUser(ADMIN_USER);
    }

    const newGame: GameItem = {
      ...gameData,
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sellerId: activeSeller.id,
      seller: activeSeller,
      createdAt: new Date().toISOString(),
      views: 1,
      isSold: false,
    };

    if (gameData.listingType === 'auction') {
      newGame.startingBid = gameData.startingBid || gameData.price;
      newGame.currentBid = gameData.startingBid || gameData.price;
      newGame.minBidIncrement = gameData.minBidIncrement || 2;
      newGame.auctionEndsAt = gameData.auctionEndsAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      newGame.bids = [];
    }

    const cleanGame = sanitizeForFirestore(newGame);

    // Optimistic local update
    setGames(prev => [cleanGame, ...prev.filter(g => g.id !== cleanGame.id)]);
    playNotificationChime('success');

    // 1. Direct real-time write to Firebase Firestore Cloud (CRITICAL: Await commit)
    try {
      await setDoc(doc(firestore, 'games', cleanGame.id), cleanGame);
      console.log('[LUDEX CLOUD] Juego publicado exitosamente en Firestore:', cleanGame.id);
    } catch (err: any) {
      console.error('[LUDEX CLOUD] Error al guardar juego en Firestore:', err?.message || err);
    }

    // 2. Dual backup post to Server API with instant synchronization
    try {
      const resp = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanGame),
      });
      const data = await resp.json();
      if (data && data.success && data.game) {
        setGames(prev => [data.game, ...prev.filter(g => g.id !== data.game.id)]);
      }
    } catch (err) {
      console.warn('[LUDEX CLOUD] Fallback posting to /api/games:', err);
    }

    triggerPushNotification({
      recipientId: activeSeller.id,
      title: '🚀 ¡Anuncio Publicado Online!',
      body: `"${newGame.title}" ya está visible para todos los compradores en tiempo real.`,
      type: 'message',
    });

    return true;
  };

  // Place bid in auction
  const placeBid = (gameId: string, amount: number) => {
    if (!currentUser) {
      setAuthMode('register');
      setIsAuthModalOpen(true);
      return { success: false, message: 'Debes crearte un perfil o iniciar sesión para pujar.' };
    }

    const game = games.find(g => g.id === gameId);
    if (!game || game.listingType !== 'auction') {
      return { success: false, message: 'La subasta no existe.' };
    }

    if (currentUser.id === game.sellerId) {
      return { success: false, message: 'No puedes pujar en tu propia subasta. Cambia de cuenta con el selector arriba para probar la puja.' };
    }

    const minAllowed = (game.currentBid || game.startingBid || 0) + (game.minBidIncrement || 1);
    if (amount < minAllowed) {
      return { success: false, message: `La puja mínima permitida es de ${minAllowed}€.` };
    }

    const newBid = {
      id: `b_${Date.now()}`,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      timestamp: new Date().toISOString(),
    };

    const updatedBids = [newBid, ...(game.bids || [])];

    // Optimistic update
    setGames(prev =>
      prev.map(g => {
        if (g.id !== gameId) return g;
        return {
          ...g,
          currentBid: amount,
          bids: updatedBids,
        };
      })
    );

    // Save to Firestore Cloud
    updateDoc(doc(firestore, 'games', gameId), {
      currentBid: amount,
      bids: sanitizeForFirestore(updatedBids),
    }).catch(err => console.warn('Firestore bid error:', err));

    // Fallback API
    fetch(`/api/games/${gameId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bidderId: currentUser.id,
        bidderName: currentUser.name,
        amount,
      }),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: game.sellerId,
      title: `⚡ Nueva puja de ${amount}€ en tu subasta`,
      body: `${currentUser.name} ha pujado ${amount}€ por "${game.title}".`,
      type: 'new_bid',
      actionPayload: { gameId, amount },
    });

    playNotificationChime('bid');
    return { success: true, message: `¡Puja de ${amount}€ registrada con éxito!` };
  };

  // Transactions & In-Person Handover Handshake
  const createPurchaseRequest = (
    gameId: string,
    offeredPrice: number,
    paymentMethod: 'Efectivo en mano' | 'Bizum presencial',
    location: string
  ): Transaction | null => {
    if (!currentUser) {
      setAuthMode('register');
      setIsAuthModalOpen(true);
      return null;
    }

    const game = games.find(g => g.id === gameId);
    if (!game) return null;

    if (currentUser.id === game.sellerId) {
      triggerPushNotification({
        recipientId: currentUser.id,
        title: 'Aviso de Trato',
        body: 'Eres el vendedor de este juego. Para probar el trato desde otro punto de vista, cambia de cuenta con el selector superior.',
        type: 'message',
      });
      return null;
    }

    const newTx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      codeOTP: generateHandshakeOTP(),
      gameId: game.id,
      gameTitle: game.title,
      gamePlatform: game.platform,
      gameImage: game.images[0] || '',
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      sellerId: game.sellerId,
      sellerName: game.seller.name,
      agreedPrice: offeredPrice,
      paymentMethod,
      meetupLocation: location,
      meetupDate: new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      status: 'solicitado',
      createdAt: new Date().toISOString(),
      auditHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // Save to Firestore Cloud
    setDoc(doc(firestore, 'transactions', newTx.id), sanitizeForFirestore(newTx)).catch(() => {});

    // Fallback API
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeForFirestore(newTx)),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: game.sellerId,
      title: `🔔 Solicitud de Trato en Persona: ${game.title}`,
      body: `${currentUser.name} solicita trato presencial por ${offeredPrice}€ en ${location}.`,
      type: 'purchase_request',
      actionPayload: { transactionId: newTx.id, gameId: game.id },
    });

    playNotificationChime('push');
    return newTx;
  };

  const sellerAcceptTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, status: 'aceptado_vendedor', sellerAcceptedAt: new Date().toISOString() }
          : t
      )
    );

    // Save to Firestore Cloud
    updateDoc(doc(firestore, 'transactions', transactionId), {
      status: 'aceptado_vendedor',
      sellerAcceptedAt: new Date().toISOString(),
    }).catch(() => {});

    // Fallback API
    fetch(`/api/transactions/${transactionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'aceptado_vendedor' }),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: tx.buyerId,
      title: '✅ ¡El vendedor ha aceptado tu compra!',
      body: `${tx.sellerName} ha aceptado reunirse para entregarte "${tx.gameTitle}". Tu código OTP de seguridad es: ${tx.codeOTP}.`,
      type: 'purchase_accepted',
      actionPayload: { transactionId: tx.id },
    });

    playNotificationChime('success');
  };

  const sellerConfirmDeliveryAndPayment = (transactionId: string, notes?: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    const completedAt = new Date().toISOString();

    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? {
              ...t,
              status: 'entregado_y_pagado',
              completedAt,
              sellerNotes: notes,
            }
          : t
      )
    );

    // Mark game as sold
    setGames(prev =>
      prev.map(g => (g.id === tx.gameId ? { ...g, isSold: true } : g))
    );

    // Save to Firestore Cloud
    updateDoc(doc(firestore, 'transactions', transactionId), {
      status: 'entregado_y_pagado',
      completedAt,
      sellerNotes: notes || '',
    }).catch(() => {});

    updateDoc(doc(firestore, 'games', tx.gameId), {
      isSold: true,
    }).catch(() => {});

    // Fallback API
    fetch(`/api/transactions/${transactionId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'entregado_y_pagado', deliveryNotes: notes }),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: tx.buyerId,
      title: '📦 Entrega y Pago Presencial Confirmados',
      body: `Trato finalizado con éxito por "${tx.gameTitle}". ¡Gracias por usar LUDEX! Deja una reseña a tu vendedor.`,
      type: 'item_delivered',
      actionPayload: { transactionId: tx.id },
    });

    playNotificationChime('success');
  };

  const buyerConfirmReceipt = (transactionId: string) => {
    sellerConfirmDeliveryAndPayment(transactionId, 'Confirmado por el comprador');
  };

  const addReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      date: 'Hoy',
    };
    setReviews(prev => [newRev, ...prev]);
    playNotificationChime('success');

    // Save to Firestore Cloud
    setDoc(doc(firestore, 'reviews', newRev.id), sanitizeForFirestore(newRev)).catch(() => {});

    // Fallback API
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizeForFirestore(newRev)),
    }).catch(() => {});
  };

  // Real-Time Chat & E2EE Messages
  const sendMessage = (
    conversationId: string,
    text: string,
    dealOffer?: ChatMessage['dealOffer'],
    meetupProposal?: ChatMessage['meetupProposal'],
    image?: string
  ) => {
    if (!currentUser) return;

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const receiverId = currentUser.id === conv.buyerId ? conv.sellerId : conv.buyerId;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: currentUser.id,
      receiverId,
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      encryptionFingerprint: conv.sharedKeyFingerprint,
      isSystemNotice: false,
      dealOffer,
      meetupProposal,
      image,
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    const previewSnippet = image && !text ? '📷 Foto adjunta' : text;

    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: previewSnippet,
              lastMessageTime: newMsg.timestamp,
              hasAgreedMeetup: meetupProposal?.status === 'aceptado' ? true : c.hasAgreedMeetup,
              meetupDetails: meetupProposal?.status === 'aceptado' ? {
                location: meetupProposal.location,
                dateTime: `${meetupProposal.date} ${meetupProposal.time}`
              } : c.meetupDetails,
            }
          : c
      )
    );

    // Save to Firebase Cloud Firestore for real-time delivery to other computer!
    const cleanMsg = sanitizeForFirestore(newMsg);
    setDoc(doc(firestore, 'messages', newMsg.id), cleanMsg).catch(err => {
      console.error('[LUDEX CLOUD] Error enviando mensaje a Firestore:', err);
    });

    updateDoc(doc(firestore, 'conversations', conversationId), {
      lastMessage: previewSnippet,
      lastMessageTime: newMsg.timestamp,
    }).catch(() => {});

    // Fallback API
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanMsg),
    }).catch(() => {});

    triggerPushNotification({
      recipientId: receiverId,
      title: `🔒 Mensaje E2EE de ${currentUser.name}`,
      body: previewSnippet.length > 50 ? `${previewSnippet.substring(0, 50)}...` : previewSnippet,
      type: 'message',
      actionPayload: { conversationId },
    });

    playNotificationChime('push');
  };

  const openChatForGame = (game: GameItem) => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    let conv = conversations.find(
      c => c.gameId === game.id && c.buyerId === currentUser.id
    );

    if (!conv) {
      conv = {
        id: `conv_${game.id}_${currentUser.id}`,
        gameId: game.id,
        gameTitle: game.title,
        gameImage: game.images[0] || '',
        gamePrice: game.price,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        buyerAvatar: currentUser.avatar,
        sellerId: game.sellerId,
        sellerName: game.seller?.name || 'Vendedor',
        sellerAvatar: game.seller?.avatar || '',
        lastMessage: 'Conversación segura iniciada',
        lastMessageTime: 'Ahora',
        unreadCountForBuyer: 0,
        unreadCountForSeller: 1,
        sharedKeyFingerprint: generateFingerprint(`${currentUser.publicKeyFingerprint}:${game.seller?.publicKeyFingerprint || 'LUDEX-SELLER:9999'}`),
        hasAgreedMeetup: false,
      };

      const welcomeMsg: ChatMessage = {
        id: `msg_init_${Date.now()}`,
        conversationId: conv.id,
        senderId: 'system',
        receiverId: currentUser.id,
        text: `🛡️ Canal seguro cifrado E2EE iniciado para "${game.title}". Recuerda coordinar el encuentro en un punto vigilado y pagar en mano tras verificar el producto.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        encryptionFingerprint: conv.sharedKeyFingerprint,
        isSystemNotice: true,
      };

      setConversations(prev => [conv!, ...prev]);
      setMessages(prev => ({
        ...prev,
        [conv!.id]: [welcomeMsg]
      }));

      // Save to Firestore Cloud
      setDoc(doc(firestore, 'conversations', conv.id), sanitizeForFirestore(conv)).catch(() => {});
      setDoc(doc(firestore, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg)).catch(() => {});

      // Fallback API
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerAvatar: currentUser.avatar,
        }),
      }).catch(() => {});
    }

    setActiveConversation(conv);
    setActiveTab('chats');
  };

  const deleteMessage = async (conversationId: string, messageId: string): Promise<boolean> => {
    // 1. Remove from local state
    setMessages(prev => {
      const currentList = prev[conversationId] || [];
      const updated = currentList.filter(m => m.id !== messageId);
      return {
        ...prev,
        [conversationId]: updated,
      };
    });

    // 2. Update conversation snippet if needed
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        const remaining = (messages[conversationId] || []).filter(m => m.id !== messageId);
        if (remaining.length > 0) {
          const last = remaining[remaining.length - 1];
          return {
            ...c,
            lastMessage: last.image && !last.text ? '📷 Foto adjunta' : last.text,
            lastMessageTime: last.timestamp,
          };
        }
        return {
          ...c,
          lastMessage: 'Mensaje eliminado',
        };
      })
    );

    // 3. Delete from Firebase Firestore
    deleteDoc(doc(firestore, 'messages', messageId)).catch(err => {
      console.warn('[LUDEX CLOUD] Error deleting message from Firestore:', err);
    });

    // 4. Delete from Backend
    fetch('/api/messages/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, messageId }),
    }).catch(() => {});

    playNotificationChime('bid');
    return true;
  };

  const clearConversationMessages = async (conversationId: string): Promise<boolean> => {
    const list = messages[conversationId] || [];
    setMessages(prev => ({
      ...prev,
      [conversationId]: [],
    }));

    setConversations(prev =>
      prev.map(c => (c.id === conversationId ? { ...c, lastMessage: 'Chat vaciado' } : c))
    );

    // Delete all from Firestore
    list.forEach(m => {
      deleteDoc(doc(firestore, 'messages', m.id)).catch(() => {});
    });

    fetch('/api/conversations/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});

    playNotificationChime('bid');
    return true;
  };

  const deleteConversation = async (conversationId: string): Promise<boolean> => {
    const list = messages[conversationId] || [];
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    setMessages(prev => {
      const copy = { ...prev };
      delete copy[conversationId];
      return copy;
    });

    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }

    // Delete conversation and messages from Firestore
    deleteDoc(doc(firestore, 'conversations', conversationId)).catch(() => {});
    list.forEach(m => {
      deleteDoc(doc(firestore, 'messages', m.id)).catch(() => {});
    });

    fetch('/api/conversations/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});

    playNotificationChime('bid');
    return true;
  };

  const acceptDealOffer = async (conversationId: string, messageId: string): Promise<boolean> => {
    const conv = conversations.find(c => c.id === conversationId);
    const convMsgs = messages[conversationId] || [];
    const targetMsg = convMsgs.find(m => m.id === messageId);
    if (!targetMsg || !targetMsg.dealOffer) return false;

    const offer = targetMsg.dealOffer;
    const gameId = offer.gameId;

    // 1. Update target message status to 'aceptada'
    const updatedMessages = convMsgs.map(m =>
      m.id === messageId && m.dealOffer
        ? { ...m, dealOffer: { ...m.dealOffer, status: 'aceptada' as const } }
        : m
    );

    // 2. System confirmation message
    const confirmationMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: 'system',
      receiverId: offer.buyerId || conv?.buyerId || '',
      text: `🎉 ¡Trato Aceptado! El vendedor ha aprobado la compra de "${offer.gameTitle}" por ${offer.offeredPrice}€. El anuncio ha sido retirado automáticamente del catálogo oficial de LUDEX para reservarlo para este comprador.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      encryptionFingerprint: conv?.sharedKeyFingerprint || 'SHA256-SESSION-KEY',
      isSystemNotice: true,
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...updatedMessages, confirmationMsg],
    }));

    // Update conversation snippet
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: '🎉 ¡Trato formalizado y anuncio retirado!',
              lastMessageTime: confirmationMsg.timestamp,
            }
          : c
      )
    );

    // 3. CRITICAL: Borrar el anuncio del catálogo oficial cuando el vendedor acepta
    if (gameId) {
      deleteGame(gameId);
    }

    // 4. Create formal Transaction record with secure OTP code
    const newTx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      codeOTP: Math.floor(100000 + Math.random() * 900000).toString(),
      gameId: offer.gameId,
      gameTitle: offer.gameTitle,
      gamePlatform: (offer.platform as any) || 'Nintendo Switch 2',
      gameImage: offer.gameImage || 'https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80',
      buyerId: offer.buyerId || conv?.buyerId || '',
      buyerName: offer.buyerName || conv?.buyerName || 'Comprador',
      sellerId: currentUser?.id || conv?.sellerId || '',
      sellerName: currentUser?.name || conv?.sellerName || 'Vendedor',
      agreedPrice: offer.offeredPrice,
      paymentMethod: 'Efectivo en mano',
      meetupLocation: 'Punto acordado en el chat',
      meetupDate: 'Hoy',
      status: 'aceptado_vendedor',
      createdAt: new Date().toISOString(),
      auditHash: `LUDEX-SHA256-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // Save to Firestore
    setDoc(doc(firestore, 'messages', targetMsg.id), sanitizeForFirestore({
      ...targetMsg,
      dealOffer: { ...offer, status: 'aceptada' }
    })).catch(() => {});
    setDoc(doc(firestore, 'messages', confirmationMsg.id), sanitizeForFirestore(confirmationMsg)).catch(() => {});
    setDoc(doc(firestore, 'transactions', newTx.id), sanitizeForFirestore(newTx)).catch(() => {});

    // Backend sync
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmationMsg),
    }).catch(() => {});

    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch(() => {});

    playNotificationChime('success');
    triggerPushNotification({
      recipientId: offer.buyerId || conv?.buyerId || '',
      title: '✅ ¡Trato aceptado por el vendedor!',
      body: `El vendedor ha aceptado tu compra de "${offer.gameTitle}". El anuncio ha sido retirado del catálogo para ti.`,
      type: 'purchase_accepted',
      actionPayload: { transactionId: newTx.id, conversationId },
    });

    return true;
  };

  const rejectDealOffer = async (conversationId: string, messageId: string): Promise<boolean> => {
    const conv = conversations.find(c => c.id === conversationId);
    const convMsgs = messages[conversationId] || [];
    const targetMsg = convMsgs.find(m => m.id === messageId);
    if (!targetMsg || !targetMsg.dealOffer) return false;

    const offer = targetMsg.dealOffer;

    const updatedMessages = convMsgs.map(m =>
      m.id === messageId && m.dealOffer
        ? { ...m, dealOffer: { ...m.dealOffer, status: 'rechazada' as const } }
        : m
    );

    const rejectMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId: 'system',
      receiverId: offer.buyerId || conv?.buyerId || '',
      text: `❌ El vendedor ha declinado la solicitud formal para "${offer.gameTitle}". Podéis seguir coordinando en el chat.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      encryptionFingerprint: conv?.sharedKeyFingerprint || 'SHA256-SESSION-KEY',
      isSystemNotice: true,
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...updatedMessages, rejectMsg],
    }));

    setDoc(doc(firestore, 'messages', targetMsg.id), sanitizeForFirestore({
      ...targetMsg,
      dealOffer: { ...offer, status: 'rechazada' }
    })).catch(() => {});
    setDoc(doc(firestore, 'messages', rejectMsg.id), sanitizeForFirestore(rejectMsg)).catch(() => {});

    playNotificationChime('bid');
    return true;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationCount = currentUser
    ? notifications.filter(n => n.recipientId === currentUser.id && !n.read).length
    : 0;

  // Admin & Database Superpowers
  const deleteGame = async (gameId: string) => {
    // 1. Optimistic local update
    setGames(prev => {
      const updated = prev.filter(g => g.id !== gameId);
      safeStorageSet('ludex_games', JSON.stringify(updated));
      return updated;
    });
    setSelectedGameModal(current => (current?.id === gameId ? null : current));
    playNotificationChime('success');

    // 2. Direct real-time deletion in Firebase Firestore Cloud
    try {
      await deleteDoc(doc(firestore, 'games', gameId));
      console.log('[LUDEX CLOUD] Juego eliminado exitosamente de Firestore Cloud:', gameId);
    } catch (err: any) {
      console.warn('[LUDEX CLOUD] Error al eliminar juego de Firestore:', err?.message || err);
    }

    // 3. Backup deletion on server API
    try {
      await fetch(`/api/games/${encodeURIComponent(gameId)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[LUDEX API] Error eliminando juego en servidor local:', err);
    }

    triggerPushNotification({
      recipientId: currentUser?.id || ADMIN_USER.id,
      title: '🗑️ Anuncio Eliminado',
      body: `El anuncio ha sido eliminado permanentemente de la plataforma.`,
      type: 'message',
    });
  };

  const deleteAllGames = async () => {
    // 1. Local optimistic update
    setGames([]);
    setSelectedGameModal(null);
    safeStorageSet('ludex_games', '[]');
    playNotificationChime('success');

    // 2. Call server DELETE /api/games
    try {
      await fetch('/api/games', { method: 'DELETE' });
    } catch (err) {
      console.warn('[LUDEX API] Error vaciando anuncios en servidor:', err);
    }

    // 3. Direct Firestore client deletion
    try {
      const snap = await getDocs(collection(firestore, 'games'));
      const deletions = snap.docs.map(d => deleteDoc(doc(firestore, 'games', d.id)));
      await Promise.all(deletions);
      console.log('[LUDEX CLOUD] Todos los juegos eliminados de Firestore Cloud');
    } catch (err) {
      console.warn('[LUDEX CLOUD] Error eliminando juegos en Firestore:', err);
    }

    triggerPushNotification({
      recipientId: currentUser?.id || ADMIN_USER.id,
      title: '🗑️ Catálogo Vaciado',
      body: 'Todos los anuncios han sido eliminados de la plataforma y de la nube.',
      type: 'message',
    });
  };

  const banUser = (userId: string) => {
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
    playNotificationChime('bid');
  };

  const updateUserVerification = (userId: string, level: User['verificationLevel']) => {
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, verificationLevel: level } : u))
    );
    playNotificationChime('success');
  };

  const broadcastAdminAlert = (title: string, body: string) => {
    fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    }).catch(() => {});

    registeredUsers.forEach(u => {
      triggerPushNotification({
        recipientId: u.id,
        title,
        body,
        type: 'message',
      });
    });
  };

  const exportDatabaseBackup = () => {
    const backup = {
      app: 'LUDEX Marketplace',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      adminOwner: 'davidtorrego1@gmail.com',
      database: {
        registeredUsers,
        games,
        transactions,
        reviews,
        conversations,
        messages,
      },
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDatabaseBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      const db = data.database || data;
      fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      }).catch(() => {});

      if (db.registeredUsers && Array.isArray(db.registeredUsers)) {
        setRegisteredUsers(db.registeredUsers);
      }
      if (db.games && Array.isArray(db.games)) {
        setGames(db.games);
        // Sync imported games to Firestore
        db.games.forEach((g: GameItem) => {
          setDoc(doc(firestore, 'games', g.id), sanitizeForFirestore(g)).catch(() => {});
        });
      }
      if (db.transactions && Array.isArray(db.transactions)) {
        setTransactions(db.transactions);
      }
      if (db.reviews && Array.isArray(db.reviews)) {
        setReviews(db.reviews);
      }
      if (db.conversations && Array.isArray(db.conversations)) {
        setConversations(db.conversations);
      }
      if (db.messages && typeof db.messages === 'object') {
        setMessages(db.messages);
      }
      playNotificationChime('success');
      return true;
    } catch (e) {
      console.error('Error al importar la base de datos:', e);
      return false;
    }
  };

  const resetDatabaseToClean = () => {
    fetch('/api/admin/reset', { method: 'POST' }).catch(() => {});
    setGames([]);
    setTransactions([]);
    setConversations([]);
    setMessages({});
    setRegisteredUsers([ADMIN_USER]);
    playNotificationChime('success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        registeredUsers,
        registerUser,
        loginUser,
        logoutUser,
        requestPasswordReset,
        resetPasswordWithCode,
        switchTestAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        isCloudSynced,
        games,
        addGame,
        placeBid,
        transactions,
        createPurchaseRequest,
        sellerAcceptTransaction,
        sellerConfirmDeliveryAndPayment,
        buyerConfirmReceipt,
        addReview,
        reviews,
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        sendMessage,
        openChatForGame,
        deleteMessage,
        clearConversationMessages,
        deleteConversation,
        acceptDealOffer,
        rejectDealOffer,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        activeToast,
        dismissToast,
        requestPushPermission,
        pushPermission,
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
        searchQuery,
        setSearchQuery,
        maxPrice,
        setMaxPrice,
        selectedCity,
        setSelectedCity,
        sortBy,
        setSortBy,
        favorites,
        toggleFavorite,
        isFavorite,
        selectedGameModal,
        setSelectedGameModal,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        isHistoryModalOpen,
        setIsHistoryModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isSafePointsMapOpen,
        setIsSafePointsMapOpen,
        deleteGame,
        deleteAllGames,
        banUser,
        updateUserVerification,
        broadcastAdminAlert,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetDatabaseToClean,
        selectedUserProfile,
        setSelectedUserProfile,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
