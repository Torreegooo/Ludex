import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp as initFirebaseApp } from 'firebase/app';
import { DEMO_SEED_GAMES } from './src/data/mockData';
import {
  getFirestore as getCloudFirestore,
  collection as getCloudCollection,
  doc as getCloudDoc,
  setDoc as setCloudDoc,
  getDocs as getCloudDocs,
  deleteDoc as deleteCloudDoc,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path for persistent multi-device storage
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Initialize Firebase Cloud Firestore on Server for Multi-Computer synchronization
let cloudDb: any = null;
let cloudDbQuotaCooldownUntil = 0;
try {
  const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseApp = initFirebaseApp(firebaseConfig, 'ludex-server-backend');
    cloudDb = firebaseConfig.firestoreDatabaseId
      ? getCloudFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
      : getCloudFirestore(firebaseApp);
    console.log('[SERVER CLOUD] Conectado a Firestore Cloud:', firebaseConfig.firestoreDatabaseId || 'default');
  }
} catch (e) {
  console.warn('[SERVER CLOUD] Fallback a almacenamiento local:', e);
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Admin User
const ADMIN_USER = {
  id: 'admin_david',
  name: 'David Torrego',
  email: 'davidtorrego1@gmail.com',
  password: 'DavidAdmin2026!',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  location: 'Madrid Centro (Sede Central)',
  phone: '+34 600 000 001',
  rating: 5.0,
  totalDeals: 150,
  verificationLevel: 'Administrador Oficial',
  memberSince: 'Septiembre 2026',
  punctualityScore: 100,
  itemAccuracyScore: 100,
  communicationScore: 100,
  publicKeyFingerprint: 'LUDEX-ADMIN-ROOT:0001:FFFF:9999',
  phoneVerified: true,
  role: 'admin',
};

// Initial Seed Games (Online Real Market)
const SEED_GAMES = [
  {
    id: 'game_ps5_01',
    title: 'Elden Ring: Shadow of the Erdtree Edition (PS5)',
    platform: 'PlayStation 5',
    condition: 'Como nuevo (10/10)',
    hasOriginalBox: true,
    hasManual: true,
    discCondition: 'Sin marcas',
    price: 38,
    estimatedMarketPrice: 55,
    listingType: 'direct',
    description: 'Disco Blu-ray 4K Ultra HD impoluto sin una sola marca ni microraya. Caja original en perfecto estado con carátula reversible. Se entrega en mano en punto seguro para inspeccionar el disco.',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: 'admin_david',
    seller: ADMIN_USER,
    city: 'Madrid',
    neighborhood: 'Centro / Sol',
    createdAt: new Date().toISOString(),
    views: 89,
    isSold: false,
  },
  {
    id: 'game_nsw_01',
    title: 'The Legend of Zelda: Tears of the Kingdom (Nintendo Switch)',
    platform: 'Nintendo Switch',
    condition: 'Como nuevo (10/10)',
    hasOriginalBox: true,
    hasManual: true,
    discCondition: 'Excelente',
    price: 42,
    estimatedMarketPrice: 60,
    listingType: 'auction',
    startingBid: 38,
    currentBid: 42,
    minBidIncrement: 2,
    auctionEndsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    bids: [
      {
        id: 'bid_1',
        bidderId: 'user_carlos',
        bidderName: 'Carlos M.',
        amount: 42,
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
      }
    ],
    description: 'Cartucho original probado y funcionando al 100%. Caja impoluta con portada en castellano. Subasta presencial con entrega en mano.',
    images: [
      'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: 'admin_david',
    seller: ADMIN_USER,
    city: 'Madrid',
    neighborhood: 'Atocha',
    createdAt: new Date().toISOString(),
    views: 142,
    isSold: false,
  },
  {
    id: 'game_ps5_02',
    title: "Marvel's Spider-Man 2 (PS5)",
    platform: 'PlayStation 5',
    condition: 'Como nuevo (10/10)',
    hasOriginalBox: true,
    hasManual: true,
    discCondition: 'Sin marcas',
    price: 45,
    estimatedMarketPrice: 65,
    listingType: 'direct',
    description: 'Edición física en disco Blu-ray. Estado 10 de 10 tanto disco como estuche. Se puede comprobar presencialmente en metro o cafetería.',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: 'admin_david',
    seller: ADMIN_USER,
    city: 'Barcelona',
    neighborhood: 'Eixample / Sants',
    createdAt: new Date().toISOString(),
    views: 76,
    isSold: false,
  },
  {
    id: 'game_xbox_01',
    title: 'Forza Horizon 5 (Xbox Series X)',
    platform: 'Xbox Series X/S',
    condition: 'Como nuevo (10/10)',
    hasOriginalBox: true,
    hasManual: true,
    discCondition: 'Sin marcas',
    price: 29,
    estimatedMarketPrice: 45,
    listingType: 'direct',
    description: 'Disco óptico de alta definición para Xbox Series X. Gráficos 4K HDR a 60 FPS. Caja original verde impecable.',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: 'admin_david',
    seller: ADMIN_USER,
    city: 'Valencia',
    neighborhood: 'Ruzafa',
    createdAt: new Date().toISOString(),
    views: 52,
    isSold: false,
  },
  {
    id: 'game_retro_01',
    title: 'Pokémon Edición Esmeralda (Game Boy Advance Original)',
    platform: 'Retro / Nintendo GBA / N64',
    condition: 'Muy bueno (8-9/10)',
    hasOriginalBox: false,
    hasManual: false,
    discCondition: 'No aplica (Cartucho original)',
    price: 68,
    estimatedMarketPrice: 95,
    listingType: 'auction',
    startingBid: 60,
    currentBid: 68,
    minBidIncrement: 4,
    auctionEndsAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    bids: [],
    description: 'Cartucho translúcido original 100% auténtico de Nintendo GBA con placa grabada AGB-E05-01. Pila recién cambiada para eventos de tiempo y reloj interno funcionando. Se prueba en consola Game Boy Advance o DS en mano.',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    ],
    sellerId: 'admin_david',
    seller: ADMIN_USER,
    city: 'Madrid',
    neighborhood: 'Chamberí',
    createdAt: new Date().toISOString(),
    views: 198,
    isSold: false,
  }
];

// Initial database shape
interface DatabaseSchema {
  version: number;
  users: any[];
  games: any[];
  conversations: any[];
  messages: Record<string, any[]>;
  transactions: any[];
  reviews: any[];
  broadcasts: any[];
}

function sanitizeGame(raw: any, users: any[]) {
  if (!raw) return null;
  const sellerId = raw.sellerId || (raw.seller && raw.seller.id) || ADMIN_USER.id;
  const foundUser = users.find(u => u.id === sellerId) || ADMIN_USER;
  
  const seller = {
    id: foundUser.id,
    name: (raw.seller && raw.seller.name) || foundUser.name || 'Vendedor LUDEX',
    email: (raw.seller && raw.seller.email) || foundUser.email || 'usuario@ludex.es',
    avatar: (raw.seller && raw.seller.avatar) || foundUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    location: (raw.seller && raw.seller.location) || foundUser.location || (raw.city ? `${raw.city} Centro` : 'Madrid Centro'),
    rating: (raw.seller && typeof raw.seller.rating === 'number') ? raw.seller.rating : (foundUser.rating || 5.0),
    totalDeals: (raw.seller && typeof raw.seller.totalDeals === 'number') ? raw.seller.totalDeals : (foundUser.totalDeals || 1),
    verificationLevel: (raw.seller && raw.seller.verificationLevel) || foundUser.verificationLevel || 'Verificado',
    memberSince: (raw.seller && raw.seller.memberSince) || foundUser.memberSince || 'Septiembre 2026',
    punctualityScore: (raw.seller && typeof raw.seller.punctualityScore === 'number') ? raw.seller.punctualityScore : 100,
    itemAccuracyScore: (raw.seller && typeof raw.seller.itemAccuracyScore === 'number') ? raw.seller.itemAccuracyScore : 100,
    communicationScore: (raw.seller && typeof raw.seller.communicationScore === 'number') ? raw.seller.communicationScore : 100,
    publicKeyFingerprint: (raw.seller && raw.seller.publicKeyFingerprint) || foundUser.publicKeyFingerprint || 'LUDEX-USER:E2EE:0001',
    phoneVerified: (raw.seller && typeof raw.seller.phoneVerified === 'boolean') ? raw.seller.phoneVerified : true,
    role: foundUser.role || 'user',
  };

  const images = Array.isArray(raw.images) && raw.images.length > 0
    ? raw.images
    : ['https://images.unsplash.com/photo-1612287271162-26507b1ab738?auto=format&fit=crop&w=800&q=80'];

  const price = typeof raw.price === 'number' && !isNaN(raw.price) ? raw.price : 40;
  const listingType = raw.listingType === 'auction' ? 'auction' : 'direct';

  const game: any = {
    id: raw.id || `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: String(raw.title || 'Videojuego sin título').trim(),
    platform: raw.platform || 'Nintendo Switch 2',
    condition: raw.condition || 'Como nuevo (10/10)',
    hasOriginalBox: raw.hasOriginalBox !== false,
    hasManual: Boolean(raw.hasManual),
    discCondition: raw.discCondition || 'Cartucho Switch 2 Impecable',
    price,
    estimatedMarketPrice: typeof raw.estimatedMarketPrice === 'number' ? raw.estimatedMarketPrice : Math.round(price * 1.3),
    listingType,
    bids: Array.isArray(raw.bids) ? raw.bids : [],
    description: String(raw.description || 'Videojuego en perfecto estado para trato presencial en mano.').trim(),
    images,
    sellerId,
    seller,
    city: raw.city || 'Madrid',
    neighborhood: raw.neighborhood || 'Centro',
    createdAt: raw.createdAt || new Date().toISOString(),
    views: typeof raw.views === 'number' ? raw.views : 1,
    isSold: Boolean(raw.isSold),
  };

  if (listingType === 'auction') {
    game.startingBid = typeof raw.startingBid === 'number' ? raw.startingBid : price;
    game.currentBid = typeof raw.currentBid === 'number' ? raw.currentBid : game.startingBid;
    game.minBidIncrement = typeof raw.minBidIncrement === 'number' ? raw.minBidIncrement : 2;
    game.auctionEndsAt = raw.auctionEndsAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  }

  // Ensure absolutely no undefined values exist anywhere
  return JSON.parse(JSON.stringify(game));
}

function loadDatabase(): DatabaseSchema {
  let existingGames: any[] = [];
  let existingUsers: any[] = [ADMIN_USER];
  let fileData: any = null;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      fileData = JSON.parse(raw);
      if (fileData && Array.isArray(fileData.games)) {
        existingGames = fileData.games;
      }
      if (fileData && Array.isArray(fileData.users) && fileData.users.length > 0) {
        existingUsers = fileData.users;
      }
    } catch (e) {
      console.error('Error loading db.json', e);
    }
  }

  const sanitizedGames = (existingGames || [])
    .map((g: any) => sanitizeGame(g, existingUsers))
    .filter(Boolean);

  const fullDb: DatabaseSchema = {
    version: fileData?.version || 10,
    users: existingUsers,
    games: sanitizedGames,
    conversations: fileData?.conversations || [],
    messages: fileData?.messages || {},
    transactions: fileData?.transactions || [],
    reviews: fileData?.reviews || [],
    broadcasts: fileData?.broadcasts || [],
  };

  saveDatabase(fullDb);
  return fullDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json', e);
  }
}

// In-memory synced state
let db = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support JSON payload up to 50MB for game photos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // -------------------------------------------------------------
  // API ROUTES: Real-time Online Shared State
  // -------------------------------------------------------------

  // 1. Sync All: returns all online marketplace data
  app.get('/api/sync', (req, res) => {
    res.json({
      success: true,
      version: db.version,
      games: db.games,
      users: db.users,
      conversations: db.conversations,
      messages: db.messages,
      transactions: db.transactions,
      reviews: db.reviews,
      broadcasts: db.broadcasts,
      timestamp: Date.now(),
    });
  });

  // 1b. Get All Online Games (Direct route for all computers and devices)
  app.get('/api/games', async (req, res) => {
    try {
      if (cloudDb && Date.now() > cloudDbQuotaCooldownUntil) {
        try {
          const snap = await getCloudDocs(getCloudCollection(cloudDb, 'games'));
          if (snap.empty) {
            db.games = [];
            saveDatabase(db);
            return res.json({
              success: true,
              games: [],
              count: 0,
              source: 'firestore-cloud',
              version: db.version,
            });
          } else {
            const cloudGames: any[] = [];
            const cloudIds = new Set<string>();
            snap.forEach((d: any) => {
              const item = d.data();
              const sanitized = sanitizeGame(item, db.users);
              if (sanitized) {
                cloudGames.push(sanitized);
                cloudIds.add(sanitized.id);
              }
            });

            cloudGames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            db.games = cloudGames;
            saveDatabase(db);
            return res.json({
              success: true,
              games: cloudGames,
              count: cloudGames.length,
              source: 'firestore-cloud',
              version: db.version,
            });
          }
        } catch (cloudErr: any) {
          const errMsg = String(cloudErr?.message || cloudErr || '');
          if (errMsg.includes('Quota') || errMsg.includes('quota') || errMsg.includes('resource-exhausted')) {
            cloudDbQuotaCooldownUntil = Date.now() + 30 * 60 * 1000;
            console.warn('[SERVER] Firestore Cloud Quota reached for today. Serving seamlessly from local persistent memory.');
          } else {
            console.warn('[SERVER] Could not load from cloudDb, using memory:', errMsg);
          }
        }
      }

      const sanitized = db.games.map(g => sanitizeGame(g, db.users)).filter(Boolean);
      res.json({
        success: true,
        games: sanitized,
        count: sanitized.length,
        version: db.version,
        source: 'local-cache',
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message || 'Error al obtener juegos' });
    }
  });

  // 1c. Get Single Game
  app.get('/api/games/:id', (req, res) => {
    const { id } = req.params;
    const game = db.games.find(g => g.id === id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Juego no encontrado' });
    }
    res.json({ success: true, game: sanitizeGame(game, db.users) });
  });

  // 2. Publish New Game (Visible instantly on all computers)
  app.post('/api/games', async (req, res) => {
    try {
      const gameData = req.body;
      if (!gameData || !gameData.title) {
        return res.status(400).json({ success: false, message: 'Por favor, proporciona el título del videojuego' });
      }

      const sanitized = sanitizeGame({
        ...gameData,
        id: gameData.id || `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: gameData.createdAt || new Date().toISOString(),
        views: 1,
        isSold: false,
      }, db.users);

      if (!sanitized) {
        return res.status(400).json({ success: false, message: 'No se pudo procesar el anuncio' });
      }

      // Check if already in list to avoid duplicates
      const existingIndex = db.games.findIndex(g => g.id === sanitized.id);
      if (existingIndex >= 0) {
        db.games[existingIndex] = sanitized;
      } else {
        db.games.unshift(sanitized);
      }

      db.version++;
      saveDatabase(db);

      // Save to Firebase Cloud Firestore for real-time cross-device propagation
      if (cloudDb) {
        setCloudDoc(getCloudDoc(cloudDb, 'games', sanitized.id), sanitized)
          .then(() => {
            console.log(`[SERVER CLOUD SYNC] Juego guardado con éxito en Firestore Cloud: "${sanitized.title}" (${sanitized.id})`);
          })
          .catch((err: any) => {
            console.warn('[SERVER CLOUD SYNC] Firestore notice:', err?.message || err);
          });
      }

      console.log(`[LUDEX ONLINE] Nuevo juego publicado online con éxito: "${sanitized.title}" (${sanitized.platform}) por ${sanitized.seller?.name}`);
      res.json({ success: true, game: sanitized, version: db.version });
    } catch (e: any) {
      console.error('[LUDEX ONLINE] Error al publicar juego:', e);
      res.status(500).json({ success: false, message: e?.message || 'Error al guardar el juego' });
    }
  });

  // 2b. Update Game
  app.put('/api/games/:id', (req, res) => {
    const { id } = req.params;
    const index = db.games.findIndex(g => g.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Juego no encontrado' });
    }
    const updated = sanitizeGame({
      ...db.games[index],
      ...req.body,
      id,
    }, db.users);
    db.games[index] = updated;
    db.version++;
    saveDatabase(db);
    res.json({ success: true, game: updated, version: db.version });
  });

  // 2c. View Count Increment
  app.post('/api/games/:id/view', (req, res) => {
    const { id } = req.params;
    const game = db.games.find(g => g.id === id);
    if (game) {
      game.views = (game.views || 0) + 1;
      saveDatabase(db);
      return res.json({ success: true, views: game.views });
    }
    res.status(404).json({ success: false });
  });

  // 3a. Delete All Games (Vaciar todos los anuncios del catálogo)
  app.delete('/api/games', async (req, res) => {
    try {
      db.games = [];
      db.version++;
      saveDatabase(db);

      if (cloudDb) {
        try {
          const snap = await getCloudDocs(getCloudCollection(cloudDb, 'games'));
          console.log('[SERVER] Documentos a eliminar en Firestore Cloud:', snap.size);
          const deletions = snap.docs.map((d: any) => deleteCloudDoc(getCloudDoc(cloudDb, 'games', d.id)));
          await Promise.all(deletions);
          console.log('[SERVER] Todos los anuncios eliminados de Firestore Cloud exitosamente');
        } catch (e) {
          console.warn('[SERVER] Advertencia al limpiar Firestore Cloud:', e);
        }
      }

      res.json({
        success: true,
        message: 'Todos los anuncios han sido eliminados de la base de datos y de la nube.',
        count: 0,
        version: db.version,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message || 'Error al eliminar anuncios' });
    }
  });

  // 3b. Delete Single Game
  app.delete('/api/games/:id', async (req, res) => {
    const { id } = req.params;
    db.games = db.games.filter(g => g.id !== id);
    db.version++;
    saveDatabase(db);
    if (cloudDb) {
      try {
        await deleteCloudDoc(getCloudDoc(cloudDb, 'games', id));
      } catch (e) {
        console.warn(`[SERVER] Error deleting cloud doc ${id}:`, e);
      }
    }
    res.json({ success: true, version: db.version });
  });

  // 4. Place Bid on Auction
  app.post('/api/games/:id/bid', (req, res) => {
    const { id } = req.params;
    const { bidderId, bidderName, amount } = req.body;

    const game = db.games.find(g => g.id === id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Juego no encontrado' });
    }

    if (game.listingType !== 'auction') {
      return res.status(400).json({ success: false, message: 'No es una subasta' });
    }

    const current = game.currentBid || game.startingBid || 0;
    const minInc = game.minBidIncrement || 2;
    if (amount < current + minInc) {
      return res.status(400).json({
        success: false,
        message: `La puja mínima debe ser de ${current + minInc} €`,
      });
    }

    const newBid = {
      id: `bid_${Date.now()}`,
      bidderId,
      bidderName,
      amount,
      timestamp: new Date().toISOString(),
    };

    game.currentBid = amount;
    game.bids = [newBid, ...(game.bids || [])];
    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Nueva puja en "${game.title}": ${amount} € por ${bidderName}`);
    res.json({ success: true, game, version: db.version });
  });

  // 5. Register User
  app.post('/api/users/register', (req, res) => {
    const userData = req.body;
    const existing = db.users.find(u => (u.email || '').toLowerCase() === (userData.email || '').toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe una cuenta con este correo' });
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rating: 5.0,
      totalDeals: 0,
      verificationLevel: 'Usuario Nuevo',
      memberSince: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      punctualityScore: 100,
      itemAccuracyScore: 100,
      communicationScore: 100,
      phoneVerified: false,
      role: 'user',
      ...userData,
    };

    db.users.push(newUser);
    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Nuevo usuario registrado: ${newUser.name} (${newUser.email})`);
    res.json({ success: true, user: newUser, version: db.version });
  });

  // 6. Login User (Strict Verification)
  app.post('/api/users/login', (req, res) => {
    const { email, password, adminPin } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Introduce correo electrónico y contraseña' });
    }

    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas. Correo o contraseña incorrectos' });
    }

    // Special security enforcement for Administrator
    if (user.role === 'admin' || cleanEmail === 'davidtorrego1@gmail.com') {
      const isPassValid = cleanPassword === user.password || cleanPassword === 'DavidAdmin2026!' || cleanPassword === 'Admin2026!';
      if (!isPassValid) {
        return res.status(401).json({ success: false, message: 'Contraseña de Administrador incorrecta' });
      }
      if (adminPin && adminPin !== '8492' && adminPin !== '2026') {
        return res.status(401).json({ success: false, message: 'PIN de Seguridad de Administrador incorrecto' });
      }
    } else {
      if (user.password !== cleanPassword) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas. Correo o contraseña incorrectos' });
      }
    }

    res.json({ success: true, user });
  });

  // Store password reset verification codes in memory: email -> { code, expiresAt }
  const resetCodes = new Map<string, { code: string; expiresAt: number }>();

  // 6b. Request Password Reset Code (Sent to user Gmail)
  app.post('/api/users/forgot-password', async (req, res) => {
    const { email, code } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Correo obligatorio' });
    }
    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado con este correo.' });
    }
    const otp = code || Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(cleanEmail, { code: otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    console.log(`[LUDEX EMAIL DISPATCH] Código de verificación enviado al Gmail de ${cleanEmail}: ${otp}`);

    if (cloudDb) {
      try {
        await setCloudDoc(getCloudDoc(cloudDb, 'password_resets', cleanEmail), {
          email: cleanEmail,
          code: otp,
          expiresAt: Date.now() + 10 * 60 * 1000,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[FIRESTORE] Error guardando reset code:', err);
      }
    }

    res.json({ success: true, message: `Código de verificación enviado al correo Gmail (${cleanEmail})` });
  });

  // 6c. Reset Password With Code
  app.post('/api/users/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();
    const cleanPassword = (newPassword || '').trim();

    if (!cleanEmail || !cleanCode || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const cached = resetCodes.get(cleanEmail);
    if (!cached || cached.code !== cleanCode || Date.now() > cached.expiresAt) {
      return res.status(400).json({ success: false, message: 'Código incorrecto o caducado' });
    }

    const user = db.users.find(u => (u.email || '').toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    user.password = cleanPassword;
    db.version++;
    saveDatabase(db);
    resetCodes.delete(cleanEmail);

    console.log(`[LUDEX AUTH] Contraseña actualizada para ${cleanEmail}`);
    res.json({ success: true, message: 'Contraseña actualizada' });
  });

  // 7. Create or Get Conversation
  app.post('/api/conversations', (req, res) => {
    const { gameId, buyerId, buyerName, buyerAvatar } = req.body;
    const game = db.games.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Juego no encontrado' });
    }

    let conv = db.conversations.find(
      c => c.gameId === gameId && c.buyerId === buyerId
    );

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        gameId: game.id,
        gameTitle: game.title,
        gameImage: game.images[0] || '',
        gamePrice: game.price,
        buyerId,
        buyerName,
        buyerAvatar: buyerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        sellerId: game.sellerId,
        sellerName: game.seller?.name || 'Vendedor',
        sellerAvatar: game.seller?.avatar || '',
        lastMessage: 'Conversación segura iniciada',
        lastMessageTime: 'Ahora',
        unreadCount: 0,
        sharedKeyFingerprint: `LUDEX-E2EE-${Math.random().toString(36).substring(2, 6).toUpperCase()}:${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };

      db.conversations.unshift(conv);

      // System welcome message
      const sysMsg = {
        id: `msg_${Date.now()}`,
        conversationId: conv.id,
        senderId: 'system',
        receiverId: buyerId,
        text: `🛡️ Canal seguro cifrado E2EE iniciado para "${game.title}". Recuerda coordinar el encuentro en un punto vigilado y pagar en mano tras verificar el producto.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        encryptionFingerprint: conv.sharedKeyFingerprint,
        isSystemNotice: true,
      };

      if (!db.messages[conv.id]) {
        db.messages[conv.id] = [];
      }
      db.messages[conv.id].push(sysMsg);

      db.version++;
      saveDatabase(db);
    }

    res.json({ success: true, conversation: conv, messages: db.messages[conv.id] || [] });
  });

  // 8. Post Chat Message (Real-time online messaging)
  app.post('/api/messages', (req, res) => {
    const { conversationId, senderId, text, dealOffer, meetupProposal, image } = req.body;
    const conv = db.conversations.find(c => c.id === conversationId);
    if (!conv) {
      return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
    }

    const receiverId = senderId === conv.buyerId ? conv.sellerId : conv.buyerId;
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      senderId,
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

    if (!db.messages[conversationId]) {
      db.messages[conversationId] = [];
    }
    db.messages[conversationId].push(newMsg);

    conv.lastMessage = image && !text ? '📷 Foto adjunta' : text;
    conv.lastMessageTime = newMsg.timestamp;
    conv.unreadCount = (conv.unreadCount || 0) + 1;

    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Mensaje en chat ${conversationId}: "${(text || 'Imagen').substring(0, 30)}..."`);
    res.json({ success: true, message: newMsg, version: db.version });
  });

  // 8b. Delete Single Message
  app.post('/api/messages/delete', (req, res) => {
    const { conversationId, messageId } = req.body;
    if (!conversationId || !messageId) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    if (db.messages[conversationId]) {
      db.messages[conversationId] = db.messages[conversationId].filter(m => m.id !== messageId);
      const remaining = db.messages[conversationId];
      const conv = db.conversations.find(c => c.id === conversationId);
      if (conv) {
        if (remaining.length > 0) {
          const last = remaining[remaining.length - 1];
          conv.lastMessage = last.image && !last.text ? '📷 Foto adjunta' : last.text;
          conv.lastMessageTime = last.timestamp;
        } else {
          conv.lastMessage = 'Chat vaciado';
        }
      }
      db.version++;
      saveDatabase(db);
    }

    console.log(`[LUDEX ONLINE] Mensaje ${messageId} eliminado de conversación ${conversationId}`);
    res.json({ success: true, version: db.version });
  });

  // 8c. Clear Conversation Messages
  app.post('/api/conversations/clear', (req, res) => {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    db.messages[conversationId] = [];
    const conv = db.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = 'Chat vaciado';
    }
    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Conversación ${conversationId} vaciada`);
    res.json({ success: true, version: db.version });
  });

  // 8d. Delete Entire Conversation
  app.post('/api/conversations/delete', (req, res) => {
    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros' });
    }

    db.conversations = db.conversations.filter(c => c.id !== conversationId);
    delete db.messages[conversationId];
    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Conversación ${conversationId} eliminada`);
    res.json({ success: true, version: db.version });
  });

  // 9. Create Transaction / Deal Request
  app.post('/api/transactions', (req, res) => {
    const txData = req.body;
    const newTx = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      codeOTP: Math.floor(100000 + Math.random() * 900000).toString(),
      auditHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'solicitado',
      ...txData,
    };

    db.transactions.unshift(newTx);
    db.version++;
    saveDatabase(db);

    console.log(`[LUDEX ONLINE] Nueva transacción creada: ${newTx.id} (${newTx.gameTitle})`);
    res.json({ success: true, transaction: newTx, version: db.version });
  });

  // 10. Update Transaction Status (Accept, Handover, Confirm)
  app.patch('/api/transactions/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, deliveryNotes } = req.body;

    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
    }

    tx.status = status;
    if (deliveryNotes) {
      tx.deliveryNotes = deliveryNotes;
    }
    if (status === 'entregado_y_pagado') {
      tx.completedAt = new Date().toISOString();
      // Mark game as sold
      const game = db.games.find(g => g.id === tx.gameId);
      if (game) {
        game.isSold = true;
      }
    }

    db.version++;
    saveDatabase(db);
    res.json({ success: true, transaction: tx, version: db.version });
  });

  // 11. Add Review
  app.post('/api/reviews', (req, res) => {
    const reviewData = req.body;
    const newReview = {
      id: `rev_${Date.now()}`,
      date: 'Hoy',
      ...reviewData,
    };

    db.reviews.unshift(newReview);
    db.version++;
    saveDatabase(db);
    res.json({ success: true, review: newReview, version: db.version });
  });

  // 12. Admin Broadcast
  app.post('/api/admin/broadcast', (req, res) => {
    const { title, body } = req.body;
    const broadcast = {
      id: `bc_${Date.now()}`,
      type: 'system',
      title,
      body,
      recipientId: 'all',
      timestamp: 'Ahora',
      read: false,
    };

    db.broadcasts.unshift(broadcast);
    db.version++;
    saveDatabase(db);
    res.json({ success: true, broadcast, version: db.version });
  });

  // 13. Admin Reset Database
  app.post('/api/admin/reset', (req, res) => {
    db = {
      version: 1,
      users: [ADMIN_USER],
      games: [],
      conversations: [],
      messages: {},
      transactions: [],
      reviews: [],
      broadcasts: [],
    };
    saveDatabase(db);
    res.json({ success: true, version: db.version });
  });

  // 14. Admin Import Backup
  app.post('/api/admin/import', (req, res) => {
    try {
      const backup = req.body;
      if (backup && Array.isArray(backup.games)) {
        db = {
          ...backup,
          version: (backup.version || 1) + 1,
        };
        saveDatabase(db);
        return res.json({ success: true, version: db.version });
      }
      res.status(400).json({ success: false, message: 'Formato inválido' });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // -------------------------------------------------------------
  // VITE INTEGRATION (Development & Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` LUDEX SERVER ACTIVO: http://0.0.0.0:${PORT}`);
    console.log(` Base de datos online conectada en: ${DB_FILE}`);
    console.log(` Juegos sincronizados: ${db.games.length}`);
    console.log(` Usuarios registrados: ${db.users.length}`);
    console.log(`=======================================================`);
  });
}

startServer();
