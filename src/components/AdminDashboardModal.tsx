import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GameItem, User, Transaction } from '../types';
import {
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
  Users,
  ShoppingBag,
  Gavel,
  FileText,
  Bell,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  Flame,
  Award,
  Lock,
  Database
} from 'lucide-react';

export const AdminDashboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    games,
    deleteGame,
    deleteAllGames,
    registeredUsers,
    banUser,
    updateUserVerification,
    transactions,
    broadcastAdminAlert,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetDatabaseToClean,
    setSelectedGameModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'transactions' | 'broadcast' | 'database'>('listings');
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  
  // Search states
  const [searchListingQuery, setSearchListingQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('🛡️ Aviso Oficial de Seguridad LUDEX');
  const [broadcastBody, setBroadcastBody] = useState('Recordatorio a todos los usuarios: las compras deben abonarse siempre en mano tras inspeccionar el disco o cartucho.');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Backup state
  const [backupJson, setBackupJson] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetClean, setConfirmResetClean] = useState(false);

  // Filtered listings
  const filteredListings = games.filter(g =>
    (g.title || '').toLowerCase().includes(searchListingQuery.toLowerCase()) ||
    (g.platform || '').toLowerCase().includes(searchListingQuery.toLowerCase()) ||
    (g.seller?.name || '').toLowerCase().includes(searchListingQuery.toLowerCase()) ||
    (g.id || '').toLowerCase().includes(searchListingQuery.toLowerCase())
  );

  // Filtered users
  const filteredUsers = registeredUsers.filter(u =>
    (u.name || '').toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.location || '').toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    broadcastAdminAlert(broadcastTitle.trim(), broadcastBody.trim());
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  const handleExport = () => {
    const json = exportDatabaseBackup();
    setBackupJson(json);
    
    // Trigger download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ludex-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Copia de seguridad JSON descargada correctamente.');
  };

  const handleImport = () => {
    if (!backupJson.trim()) {
      setBackupStatus('⚠️ Pega el contenido JSON de la copia de seguridad para restaurar la base de datos.');
      return;
    }
    const success = importDatabaseBackup(backupJson);
    if (success) {
      setBackupStatus('✅ Base de datos restaurada con éxito.');
    } else {
      setBackupStatus('❌ Error al restaurar: Formato JSON no válido.');
    }
  };

  const totalVolume = transactions
    .filter(t => t.status === 'entregado_y_pagado')
    .reduce((acc, t) => acc + t.agreedPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 max-w-5xl w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Panel de Administración Central
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                  SuperAdmin Root
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                davidtorrego1@gmail.com • Control total de anuncios, moderación de usuarios y base de datos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Platform KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider block font-semibold">
              Anuncios Activos
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {games.length}
              </span>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider block font-semibold">
              Usuarios Registrados
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {registeredUsers.length}
              </span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider block font-semibold">
              Tratos Presenciales
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                {transactions.length}
              </span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider block font-semibold">
              Volumen Acordado
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {totalVolume} €
              </span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs within Admin */}
        <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'listings'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Moderación de Anuncios ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Gestión de Usuarios ({registeredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Auditoría de Tratos ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'broadcast'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Difusión Push a Usuarios</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'database'
                ? 'bg-zinc-900 dark:bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Base de Datos & Backup</span>
          </button>
        </div>

        {/* TAB 1: LISTINGS MODERATION (DELETE ANY ANNOUNCEMENT) */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar anuncio por título, plataforma o vendedor..."
                  value={searchListingQuery}
                  onChange={e => setSearchListingQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {games.length > 0 && (
                  isConfirmingDeleteAll ? (
                    <div className="flex items-center gap-1.5 bg-rose-600/20 border border-rose-500 rounded-xl p-1 animate-in fade-in">
                      <span className="text-xs text-rose-300 font-bold px-2">¿Seguro que deseas borrar los {games.length} anuncios?</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteAllGames();
                          setIsConfirmingDeleteAll(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-colors"
                      >
                        Sí, Borrar Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDeleteAll(false)}
                        className="px-2 py-1 text-zinc-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDeleteAll(true)}
                      className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      title="Elimina todos los anuncios del catálogo y de la base de datos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Vaciar Catálogo ({games.length})
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  No hay anuncios que coincidan con la búsqueda
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Cuando los usuarios publiquen videojuegos o subastas aparecerán en esta tabla.
                </p>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden overflow-x-auto text-xs">
                <table className="w-full text-left divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold uppercase text-[10px] text-zinc-400 tracking-wider">
                    <tr>
                      <th className="p-3">Videojuego</th>
                      <th className="p-3">Plataforma</th>
                      <th className="p-3">Tipo / Precio</th>
                      <th className="p-3">Vendedor</th>
                      <th className="p-3">Ciudad</th>
                      <th className="p-3 text-right">Acción Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredListings.map(game => (
                      <tr key={game.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={game.images[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=100&q=80'}
                              alt=""
                              className="w-10 h-8 rounded object-cover border border-zinc-700"
                            />
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-white line-clamp-1">
                                {game.title}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ID: {game.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            {game.platform}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          {game.listingType === 'auction' ? (
                            <span className="text-amber-500">
                              Subasta ({game.currentBid || game.startingBid} €)
                            </span>
                          ) : (
                            <span className="text-emerald-500">
                              Directa ({game.price} €)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">
                          {game.seller.name}
                        </td>
                        <td className="p-3 text-zinc-500">
                          {game.city}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedGameModal(game)}
                              className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium"
                              title="Ver detalles"
                            >
                              Ver
                            </button>
                            {confirmDeleteId === game.id ? (
                              <div className="flex items-center gap-1 bg-rose-600/20 border border-rose-500 rounded-lg p-0.5 animate-in fade-in">
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteGame(game.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold shadow-sm"
                                  title="Confirmar eliminación permanente"
                                >
                                  ¿Borrar? Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-zinc-400 hover:text-white text-[11px]"
                                  title="Cancelar"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(game.id)}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                                title="Borrar anuncio permanentemente de la base de datos"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Borrar Anuncio</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre o email..."
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold uppercase text-[10px] text-zinc-400 tracking-wider">
                  <tr>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Nivel de Confianza</th>
                    <th className="p-3">Huella E2EE</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acción Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {user.location}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-zinc-500">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <select
                          value={user.verificationLevel}
                          onChange={e => updateUserVerification(user.id, e.target.value as any)}
                          className="px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-[11px] font-semibold text-zinc-900 dark:text-white"
                        >
                          <option value="Administrador Oficial">Administrador Oficial</option>
                          <option value="Coleccionista Pro">Coleccionista Pro</option>
                          <option value="SuperVendedor">SuperVendedor</option>
                          <option value="Verificado DNI">Verificado DNI</option>
                          <option value="Usuario Nuevo">Usuario Nuevo</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-emerald-500">
                        {user.publicKeyFingerprint.substring(0, 18)}...
                      </td>
                      <td className="p-3">
                        {user.isBanned ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 text-[10px] font-bold">
                            Suspendido
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {user.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => banUser(user.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                              user.isBanned
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-rose-600 hover:bg-rose-500 text-white'
                            }`}
                          >
                            {user.isBanned ? 'Reactivar' : 'Suspender'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTIONS & SECURITY AUDIT */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400">
              Registro inmutable de acuerdos presenciales protegidos con PIN OTP y huella criptográfica SHA256.
            </p>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950 font-bold uppercase text-[10px] text-zinc-400 tracking-wider">
                  <tr>
                    <th className="p-3">Transacción</th>
                    <th className="p-3">Videojuego</th>
                    <th className="p-3">Vendedor & Comprador</th>
                    <th className="p-3">Importe</th>
                    <th className="p-3">PIN Trato</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Audit Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-bold text-zinc-900 dark:text-white">
                        {t.id}
                      </td>
                      <td className="p-3 font-sans">
                        {t.gameTitle}
                      </td>
                      <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">
                        {t.sellerName} → {t.buyerName}
                      </td>
                      <td className="p-3 text-emerald-500 font-bold">
                        {t.agreedPrice} €
                      </td>
                      <td className="p-3 tracking-widest text-amber-500 font-bold">
                        {t.codeOTP}
                      </td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-zinc-500">
                        {t.auditHash.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BROADCAST PUSH NOTIFICATIONS */}
        {activeTab === 'broadcast' && (
          <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Título del Aviso Push Oficial
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Mensaje de la Alerta (Aparecerá en el móvil de todos los usuarios)
              </label>
              <textarea
                rows={3}
                required
                value={broadcastBody}
                onChange={e => setBroadcastBody(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            {broadcastSent && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Notificación Push emitida con éxito a toda la plataforma!</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Emitir Notificación Push Global</span>
            </button>
          </form>
        )}

        {/* TAB 5: DATABASE & BACKUP */}
        {activeTab === 'database' && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                Exportar Copia de Seguridad de la Base de Datos
              </h4>
              <p className="text-zinc-500 leading-relaxed">
                Descarga una instantánea completa en formato JSON con todos los usuarios registrados, anuncios publicados, pujas, transacciones y reseñas.
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar y Descargar JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" />
                Restaurar Base de Datos desde JSON
              </h4>
              <textarea
                rows={4}
                placeholder="Pega aquí el contenido JSON exportado previamente para restaurar..."
                value={backupJson}
                onChange={e => setBackupJson(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Restaurar Base de Datos</span>
              </button>
            </div>

            {backupStatus && (
              <p className="text-xs font-semibold text-emerald-500">{backupStatus}</p>
            )}

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {confirmResetClean ? (
                <div className="flex flex-wrap items-center gap-2 bg-rose-950/40 border border-rose-500/50 p-3 rounded-lg">
                  <span className="text-xs text-rose-300 font-bold">¿Seguro que deseas eliminar todos los anuncios publicados?</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        resetDatabaseToClean();
                        setConfirmResetClean(false);
                        setBackupStatus('✅ Base de datos restablecida a estado limpio.');
                      }}
                      className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm"
                    >
                      Sí, Limpiar Base de Datos
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetClean(false)}
                      className="px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmResetClean(true)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-rose-900/60 border border-zinc-700 hover:border-rose-700 text-zinc-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar Todos los Anuncios (Estado Limpio)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-xs"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
