import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Handshake,
  AlertCircle,
  FileText,
  Printer,
  Star,
  Lock,
  ArrowRight,
  MapPin,
  DollarSign,
  UserCheck
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const {
    transactions,
    currentUser,
    setIsAuthModalOpen,
    setAuthMode,
    sellerAcceptTransaction,
    sellerConfirmDeliveryAndPayment,
    buyerConfirmReceipt,
    addReview,
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [reviewTx, setReviewTx] = useState<Transaction | null>(null);

  // Review modal state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Seller delivery confirmation modal state
  const [confirmDeliveryTx, setConfirmDeliveryTx] = useState<Transaction | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('El comprador examinó el disco/cartucho en persona y abonó el importe convenido en efectivo.');
  const [isCashVerified, setIsCashVerified] = useState<boolean>(true);
  const [isGameHandedOver, setIsGameHandedOver] = useState<boolean>(true);
  const [deliveryError, setDeliveryError] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 sm:p-14 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Historial de Tratos y Recibos
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Crea tu perfil o inicia sesión para consultar tus solicitudes de compraventa presencial, códigos OTP de trato y recibos certificados.
          </p>
        </div>
        <button
          onClick={() => {
            setAuthMode('register');
            setIsAuthModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          Crear Perfil en LUDEX
        </button>
      </div>
    );
  }

  // Filter transactions relevant to current user
  const userTransactions = transactions.filter(
    t => t.buyerId === currentUser.id || t.sellerId === currentUser.id
  );

  const filteredTransactions = userTransactions.filter(t => {
    if (activeTabFilter === 'pending') {
      return t.status === 'solicitado' || t.status === 'aceptado_vendedor';
    }
    if (activeTabFilter === 'completed') {
      return t.status === 'entregado_y_pagado';
    }
    return true;
  });

  const handleCompleteDelivery = () => {
    if (!confirmDeliveryTx) return;
    if (!isCashVerified || !isGameHandedOver) {
      setDeliveryError('Debes marcar las dos casillas de verificación para certificar la entrega física.');
      return;
    }
    setDeliveryError('');
    sellerConfirmDeliveryAndPayment(confirmDeliveryTx.id, deliveryNotes);
    setConfirmDeliveryTx(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTx) return;

    addReview({
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      targetUserId: currentUser.id === reviewTx.buyerId ? reviewTx.sellerId : reviewTx.buyerId,
      rating: reviewRating,
      comment: reviewComment || 'Trato presencial impecable y seguro.',
      gameTitle: reviewTx.gameTitle,
      dealType: reviewTx.paymentMethod === 'Efectivo en mano' ? 'Presencial - Efectivo' : 'Presencial - Bizum',
    });

    setReviewTx(null);
    setReviewComment('');
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'solicitado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pendiente Aprobación Vendedor
          </span>
        );
      case 'aceptado_vendedor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
            <Handshake className="w-3.5 h-3.5" />
            Trato Aceptado - Pendiente de Encuentro
          </span>
        );
      case 'entregado_y_pagado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completado en Mano
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Historial de Tratos y Recibos Auditados
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Registro inmutable de acuerdos de compraventa presenciales protegidos bajo el protocolo LUDEX.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTabFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Todos ({userTransactions.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTabFilter === 'pending'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            En Curso
          </button>
          <button
            onClick={() => setActiveTabFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTabFilter === 'completed'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Completados
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <Handshake className="w-12 h-12 mx-auto mb-3 text-zinc-400 stroke-1" />
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              No hay transacciones en esta vista
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Explora el catálogo o participa en una subasta para solicitar un trato presencial seguro.
            </p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            const isSeller = currentUser.id === tx.sellerId;
            const isBuyer = currentUser.id === tx.buyerId;

            return (
              <div
                key={tx.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Header: ID, Date, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">
                      {tx.id}
                    </span>
                    <span className="text-xs text-zinc-400">
                      Iniciado: {new Date(tx.createdAt).toLocaleDateString()} a las {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>{getStatusBadge(tx.status)}</div>
                </div>

                {/* Main Body: Game Thumb, Counterpart, Price, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Game Info */}
                  <div className="sm:col-span-6 flex items-center gap-3.5">
                    <img
                      src={tx.gameImage}
                      alt={tx.gameTitle}
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">
                        {tx.gameTitle}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {tx.gamePlatform} • Rol: <strong className="text-zinc-800 dark:text-zinc-200">{isSeller ? 'Vendedor' : 'Comprador'}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>{tx.meetupLocation}</span>
                      </p>
                    </div>
                  </div>

                  {/* Price & Method */}
                  <div className="sm:col-span-3 text-left sm:text-center border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
                      Importe en Mano
                    </span>
                    <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">
                      {tx.agreedPrice} €
                    </span>
                    <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {tx.paymentMethod}
                    </span>
                  </div>

                  {/* Handshake OTP Code */}
                  <div className="sm:col-span-3 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-4">
                    <span className="text-[11px] text-zinc-400 block uppercase tracking-wider">
                      PIN de Trato Presencial
                    </span>
                    <span className="text-lg font-mono font-bold tracking-widest text-emerald-500">
                      {tx.codeOTP}
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Verificar antes del intercambio
                    </span>
                  </div>

                </div>

                {/* Audit Hash & Action Footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Audit Hash: {tx.auditHash}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Seller Action 1: Accept Purchase Request */}
                    {isSeller && tx.status === 'solicitado' && (
                      <button
                        onClick={() => sellerAcceptTransaction(tx.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aceptar Compra (Enviar Push al Comprador)</span>
                      </button>
                    )}

                    {/* Seller Action 2: Confirm Delivery & In-Person Payment Received */}
                    {isSeller && tx.status === 'aceptado_vendedor' && (
                      <button
                        onClick={() => setConfirmDeliveryTx(tx)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Aprobar Entrega y Cobro en Mano</span>
                      </button>
                    )}

                    {/* Buyer Action: Confirm receipt if seller completed */}
                    {isBuyer && tx.status === 'aceptado_vendedor' && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span>Esperando encuentro presencial con el vendedor.</span>
                      </div>
                    )}

                    {/* Review Button for completed deals */}
                    {tx.status === 'entregado_y_pagado' && (
                      <button
                        onClick={() => setReviewTx(tx)}
                        className="px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>Valorar Trato</span>
                      </button>
                    )}

                    {/* Receipt print / view button */}
                    <button
                      onClick={() => setSelectedReceiptTx(tx)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Recibo Certificado</span>
                    </button>

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Seller Delivery & Payment Confirmation Modal */}
      {confirmDeliveryTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-emerald-500" />
                Aprobación de Entrega y Pago Presencial
              </h3>
              <button
                onClick={() => setConfirmDeliveryTx(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
              <p><strong>Artículo:</strong> {confirmDeliveryTx.gameTitle}</p>
              <p><strong>Comprador:</strong> {confirmDeliveryTx.buyerName}</p>
              <p><strong>Importe Acordado:</strong> <span className="font-mono font-bold text-emerald-500">{confirmDeliveryTx.agreedPrice} € ({confirmDeliveryTx.paymentMethod})</span></p>
              <p><strong>Punto de Encuentro:</strong> {confirmDeliveryTx.meetupLocation}</p>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-2.5 pt-2 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCashVerified}
                  onChange={e => setIsCashVerified(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Certifico que he recibido el <strong>pago en mano ({confirmDeliveryTx.paymentMethod})</strong> de {confirmDeliveryTx.agreedPrice} € directamente del comprador.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGameHandedOver}
                  onChange={e => setIsGameHandedOver(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-zinc-700 dark:text-zinc-300">
                  Certifico que he entregado físicamente el videojuego tras ser inspeccionado por el comprador.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Notas del Trato Presencial (Opcional)
              </label>
              <textarea
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            {deliveryError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                {deliveryError}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDeliveryTx(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteDelivery}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                Aprobar y Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Valorar Experiencia de Trato Presencial
              </h3>
              <button
                type="button"
                onClick={() => setReviewTx(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Tu reseña se sumará al cálculo de fiabilidad del usuario (Puntualidad en el encuentro, estado fiel del juego y comunicación).
            </p>

            {/* Stars selection */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Comentario sobre el trato en mano
              </label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Ejemplo: Puntual en el punto de encuentro, juego en perfecto estado tal como se describió..."
                className="w-full p-2.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewTx(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Publicar Valoración
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white font-mono tracking-tight">
                    LUDEX CERTIFIED RECEIPT
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Comprobante de Trato Seguro entre Particulares
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Receipt Data Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs bg-zinc-50 dark:bg-zinc-950">
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Nº Transacción:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedReceiptTx.id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Videojuego:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedReceiptTx.gameTitle}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Plataforma:</span>
                <span>{selectedReceiptTx.gamePlatform}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Vendedor:</span>
                <span>{selectedReceiptTx.sellerName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Comprador:</span>
                <span>{selectedReceiptTx.buyerName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Modalidad Pago:</span>
                <span className="text-emerald-500 font-bold">{selectedReceiptTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-zinc-500">Punto Encuentro:</span>
                <span className="text-right text-[11px]">{selectedReceiptTx.meetupLocation}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold">
                <span>IMPORTE TOTAL:</span>
                <span className="text-emerald-500">{selectedReceiptTx.agreedPrice} €</span>
              </div>
            </div>

            {/* Cryptographic Proof */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700/60 text-[11px] font-mono space-y-1">
              <span className="block text-zinc-500 uppercase tracking-wider text-[10px]">
                Huella Criptográfica de Auditoría
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 break-all">
                {selectedReceiptTx.auditHash}
              </span>
              <p className="text-[10px] text-zinc-400 pt-1">
                Este comprobante certifica la conformidad del vendedor y comprador en el trato presencial bajo la directiva de bienes usados.
              </p>
            </div>

            {/* Print / Download / Close */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch (e) {
                    console.warn('Print not supported in iframe context', e);
                  }
                }}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const receiptText = `=== COMPROBANTE OFICIAL DE TRATO SEGURO LUDEX ===
Nº Transacción: ${selectedReceiptTx.id}
Fecha: ${new Date(selectedReceiptTx.createdAt).toLocaleString()}
Videojuego: ${selectedReceiptTx.gameTitle} (${selectedReceiptTx.gamePlatform})
Vendedor: ${selectedReceiptTx.sellerName}
Comprador: ${selectedReceiptTx.buyerName}
Modalidad de Pago: ${selectedReceiptTx.paymentMethod}
Importe Acordado: ${selectedReceiptTx.agreedPrice} €
Punto de Encuentro Seguro: ${selectedReceiptTx.meetupLocation}
Código PIN OTP de Trato: ${selectedReceiptTx.codeOTP}
Huella Criptográfica SHA-256: ${selectedReceiptTx.auditHash}
Estado: ${selectedReceiptTx.status}
Certificación: Conforme a la verificación física presencial LUDEX.`;

                  const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `comprobante-ludex-${selectedReceiptTx.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Descargar TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
