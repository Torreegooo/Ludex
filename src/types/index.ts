export type Platform =
  // PlayStation Family
  | 'PlayStation 5'
  | 'PlayStation 4'
  | 'PlayStation 3'
  | 'PlayStation 2'
  | 'PlayStation 1'
  | 'PlayStation Portable (PSP)'
  | 'PlayStation Vita'
  | 'PlayStation VR / VR2'
  // Nintendo Home Consoles
  | 'Nintendo Switch 2'
  | 'Nintendo Switch'
  | 'Nintendo Wii U'
  | 'Nintendo Wii'
  | 'Nintendo GameCube'
  | 'Nintendo 64 (N64)'
  | 'Super Nintendo (SNES)'
  | 'Nintendo (NES)'
  | 'Virtual Boy'
  // Nintendo Handhelds
  | 'Nintendo 3DS / 2DS'
  | 'Nintendo DS'
  | 'Game Boy Advance (GBA)'
  | 'Game Boy Color'
  | 'Game Boy (Clásica)'
  | 'Game Boy / Color'
  | 'Game Boy Micro'
  | 'Game & Watch'
  // Xbox Family
  | 'Xbox Series X/S'
  | 'Xbox One'
  | 'Xbox 360'
  | 'Xbox Original'
  // SEGA Family
  | 'SEGA Dreamcast'
  | 'SEGA Saturn'
  | 'SEGA Mega Drive'
  | 'SEGA Mega-CD / 32X'
  | 'SEGA Master System'
  | 'SEGA Game Gear'
  | 'SEGA Master System / Game Gear'
  // Retro Legends & Arcade Cult Systems
  | 'Neo Geo AES / MVS'
  | 'Neo Geo CD'
  | 'Neo Geo Pocket / Color'
  | 'Neo Geo / Arcade'
  | 'PC Engine / TurboGrafx-16'
  | 'Atari 2600 / 7800'
  | 'Atari Jaguar / Lynx'
  | '3DO Interactive Multiplayer'
  | 'WonderSwan / Color'
  | 'Amiga CD32 / Commodore'
  | 'MSX / Spectrum / Retro PC'
  | 'Philips CD-i'
  | 'Pokémon Mini'
  // Handhelds & PC
  | 'Steam Deck / PC Portátil'
  | 'PC Físico'
  // Backward compatibility aliases
  | 'Retro / PS2 / PS1'
  | 'Retro / Nintendo GBA / N64';

export type ProductCondition =
  | 'Precintado / Nuevo'
  | 'Como nuevo (10/10)'
  | 'Muy bueno (8-9/10)'
  | 'Buen estado (7/10)'
  | 'Aceptable (con marcas)';

export type ListingType = 'direct' | 'auction';

export type TransactionStatus =
  | 'solicitado'           // Comprador ha solicitado el trato
  | 'aceptado_vendedor'    // Vendedor ha aceptado la compra vía push
  | 'encuentro_agendado'   // Lugar y hora de encuentro fijados
  | 'entregado_y_pagado'   // Vendedor y comprador confirman entrega y pago presencial
  | 'cancelado';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  location: string;
  phone?: string;
  rating: number; // 0.0 - 5.0
  totalDeals: number;
  verificationLevel: 'Verificado DNI' | 'SuperVendedor' | 'Coleccionista Pro' | 'Usuario Nuevo' | 'Verificado' | 'Administrador Oficial';
  memberSince: string;
  punctualityScore: number; // 0 - 100%
  itemAccuracyScore: number; // 0 - 100%
  communicationScore: number; // 0 - 100%
  publicKeyFingerprint: string; // E2EE key fingerprint
  phoneVerified: boolean;
  role?: 'admin' | 'user';
  isBanned?: boolean;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  targetUserId: string;
  rating: number;
  comment: string;
  date: string;
  gameTitle: string;
  dealType: 'Presencial - Efectivo' | 'Presencial - Bizum';
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
}

export interface GameItem {
  id: string;
  title: string;
  platform: Platform;
  condition: ProductCondition;
  hasOriginalBox: boolean;
  hasManual: boolean;
  discCondition: 'Sin marcas' | 'Microrayas superficiales' | 'Excelente' | 'No aplica (Cartucho original)' | 'Cartucho Switch 2 Impecable';
  price: number;
  estimatedMarketPrice: number;
  listingType: ListingType;
  startingBid?: number;
  currentBid?: number;
  minBidIncrement?: number;
  auctionEndsAt?: string;
  bids?: Bid[];
  description: string;
  images: string[];
  sellerId: string;
  seller: User;
  city: string;
  neighborhood: string;
  createdAt: string;
  views: number;
  isSold?: boolean;
}

export interface SafeMeetupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  type: 'Comisaría / Estación' | 'Centro Comercial Vigilado' | 'Cafetería Pública Concurrida';
  safetyRating: number;
  description?: string;
  securityFeatures?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  encryptionFingerprint: string;
  isSystemNotice?: boolean;
  image?: string;
  meetupProposal?: {
    location: string;
    date: string;
    time: string;
    status: 'propuesto' | 'aceptado' | 'rechazado';
  };
  dealOffer?: {
    gameId: string;
    gameTitle: string;
    gameImage?: string;
    offeredPrice: number;
    platform?: string;
    buyerId?: string;
    buyerName?: string;
    sellerId?: string;
    status: 'pendiente' | 'aceptada' | 'rechazada' | 'entregada';
  };
}

export interface Conversation {
  id: string;
  gameId: string;
  gameTitle: string;
  gameImage: string;
  gamePrice: number;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountForBuyer: number;
  unreadCountForSeller: number;
  sharedKeyFingerprint: string;
  hasAgreedMeetup: boolean;
  meetupDetails?: {
    location: string;
    dateTime: string;
  };
}

export interface Transaction {
  id: string;
  codeOTP: string;
  gameId: string;
  gameTitle: string;
  gamePlatform: Platform;
  gameImage: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  agreedPrice: number;
  paymentMethod: 'Efectivo en mano' | 'Bizum presencial';
  meetupLocation: string;
  meetupDate: string;
  status: TransactionStatus;
  createdAt: string;
  sellerAcceptedAt?: string;
  completedAt?: string;
  sellerNotes?: string;
  buyerFeedbackLeft?: boolean;
  sellerFeedbackLeft?: boolean;
  auditHash: string;
}

export interface PushNotification {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: 'purchase_request' | 'purchase_accepted' | 'new_bid' | 'auction_outbid' | 'item_delivered' | 'message';
  timestamp: string;
  read: boolean;
  actionPayload?: {
    transactionId?: string;
    conversationId?: string;
    gameId?: string;
    amount?: number;
  };
}
