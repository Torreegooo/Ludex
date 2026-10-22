import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  UserPlus,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
  Check,
  Copy
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
];

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPasswordWithCode
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Madrid');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Recovery fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Security & Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const isLoggingAsAdmin = loginEmail.trim().toLowerCase() === 'davidtorrego1@gmail.com';

  // Register handler with strict validations
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      setError('Por favor indica tu nombre o alias de usuario.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor introduce un correo electrónico válido.');
      return;
    }
    if (cleanEmail === 'davidtorrego1@gmail.com') {
      setError('Este correo está reservado exclusivamente para la administración oficial.');
      return;
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres por seguridad.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }
    if (!termsAccepted) {
      setError('Debes aceptar las normas de trato presencial seguro de LUDEX.');
      return;
    }

    setIsSubmitting(true);
    const res = registerUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone.trim() || '+34 600 000 000',
      location: `${city} y alrededores`,
      avatar,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccessMsg('¡Perfil creado con éxito! Iniciando sesión...');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  // Login handler with rate limiting and admin verification
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutSeconds > 0) {
      setError(`Demasiados intentos fallidos. Espera ${lockoutSeconds} segundos por seguridad.`);
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    if (!cleanEmail) {
      setError('Introduce tu correo electrónico.');
      return;
    }

    if (!cleanPassword) {
      setError('Introduce tu contraseña.');
      return;
    }

    if (isLoggingAsAdmin && !adminPin.trim()) {
      setError('Para acceder como Administrador Oficial debes introducir el PIN de Seguridad.');
      return;
    }

    setIsSubmitting(true);
    const res = loginUser(cleanEmail, cleanPassword, adminPin.trim());
    setIsSubmitting(false);

    if (!res.success) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 4) {
        setLockoutSeconds(30);
        setError('Demasiados intentos fallidos. Por seguridad, el acceso se bloquea durante 30 segundos.');
      } else {
        setError(`${res.message} (Intento ${nextFailed}/4)`);
      }
      return;
    }

    // Success: reset attempts
    setFailedAttempts(0);
    setSuccessMsg('Sesión iniciada correctamente.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Password Recovery - Step 1: Request Code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor, introduce un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset(cleanEmail);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setResetCode('');
    setResetStep(2);
    setSuccessMsg(`Código de verificación enviado con éxito a tu correo Gmail (${cleanEmail}).`);
  };

  // Password Recovery - Step 2: Confirm Code and Set New Password
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetCode.trim()) {
      setError('Introduce el código de 6 dígitos que has recibido.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres por seguridad.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPasswordWithCode(forgotEmail.trim().toLowerCase(), resetCode.trim(), newPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccessMsg('¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión...');
    setTimeout(() => {
      setLoginEmail(forgotEmail.trim().toLowerCase());
      setLoginPassword('');
      setMode('login');
      setError('');
      setSuccessMsg('Tu contraseña ha sido actualizada. Introduce tu nueva contraseña para iniciar sesión.');
      setResetStep(1);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl my-auto max-h-[94vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              mode === 'forgot'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}>
              {mode === 'forgot' ? (
                <RotateCcw className="w-5 h-5 text-amber-500" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {mode === 'register' && 'Crear Perfil en LUDEX'}
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {mode === 'forgot'
                  ? 'Verificación de seguridad en dos pasos'
                  : 'Mercado seguro con identidad verificada y tratos en mano'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Visible in Login & Register) */}
        {mode !== 'forgot' ? (
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Perfil</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
                setResetStep(1);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
              Paso {resetStep} de 2
            </span>
          </div>
        )}

        {/* Notifications and Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* MODE: FORGOT PASSWORD */}
        {/* ----------------------------------------------------------- */}
        {mode === 'forgot' ? (
          <div className="space-y-4 text-xs">
            {resetStep === 1 ? (
              /* Step 1: Input email to receive security code */
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Recuperación Segura de Contraseña
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Indica el correo de tu cuenta en LUDEX. Te enviaremos un código de seguridad de 6 dígitos para validar tu identidad.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Correo Electrónico Registrado *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com o davidtorrego1@gmail.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verificando cuenta...' : 'Generar y Enviar Código'}</span>
                </button>
              </form>
            ) : (
              /* Step 2: Validate code & Set New Password */
              <form onSubmit={handleConfirmReset} className="space-y-4">
                {/* Gmail Verification Code Delivery Notice */}
                <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span>Código enviado a tu correo Gmail</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-bold">
                      Válido 10 min
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Hemos enviado el código de verificación de 6 dígitos a <strong>{forgotEmail}</strong>.
                    <br />
                    Revisa tu bandeja de entrada en <strong>Gmail</strong> (y tu carpeta de <em>Spam / Correo no deseado</em>) e introduce los 6 dígitos a continuación para restablecer tu contraseña.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Abrir Gmail ({forgotEmail})</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleRequestReset}
                      disabled={isSubmitting}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reenviar código</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Código de 6 Dígitos recibido en Gmail *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Introduce el código de 6 dígitos"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono tracking-widest text-base text-center font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nueva Contraseña (mínimo 6 caracteres) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Escribe tu nueva contraseña secreta"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Repite la nueva contraseña"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? 'Guardando...' : 'Guardar y Restablecer'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : mode === 'register' ? (
          /* ----------------------------------------------------------- */
          /* MODE: REGISTER */
          /* ----------------------------------------------------------- */
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre o Alias de Usuario *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. MarioGamer99"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contraseña (mín. 6 car.) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Repetir Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Repite la clave"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Teléfono (WhatsApp Trato)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Ciudad Principal *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Madrid">Madrid (Metro y Cercanías)</option>
                  <option value="Barcelona">Barcelona (Eixample y Centro)</option>
                  <option value="Valencia">Valencia (Centro)</option>
                  <option value="Sevilla">Sevilla</option>
                  <option value="Zaragoza">Zaragoza</option>
                  <option value="Málaga">Málaga</option>
                  <option value="Bilbao">Bilbao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt="Avatar seleccionado"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500 shrink-0"
                />
                <div className="flex gap-2 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(p)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                        avatar === p ? 'border-emerald-500 scale-110 ring-2 ring-emerald-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
              />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                Acepto el protocolo de <strong>pagos presenciales en mano</strong> y las normas de trato seguro de LUDEX.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta y Comenzar'}</span>
            </button>
          </form>
        ) : (
          /* ----------------------------------------------------------- */
          /* MODE: LOGIN */
          /* ----------------------------------------------------------- */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Special Administrator Badge if Admin Email is typed */}
            {isLoggingAsAdmin && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-purple-500" />
                  <span>Acceso de Administrador Oficial de LUDEX</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Esta cuenta cuenta con privilegios de gestión. Requiere tu contraseña maestra y el PIN de seguridad.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Contraseña
                </label>
                {/* Botón ¿Has olvidado tu contraseña? */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotEmail(loginEmail);
                    setError('');
                    setSuccessMsg('');
                    setResetStep(1);
                  }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>¿He olvidado mi contraseña?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tu contraseña secreta"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Security PIN field (Required for Administrator) */}
            {isLoggingAsAdmin && (
              <div>
                <label className="block font-semibold text-purple-700 dark:text-purple-300 mb-1 flex items-center justify-between">
                  <span>PIN de Seguridad de Administrador *</span>
                  <span className="text-[10px] text-zinc-400 font-normal">PIN Oficial: 8492</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                  <input
                    type="password"
                    required
                    maxLength={6}
                    placeholder="Introduce el PIN Maestro (8492)"
                    value={adminPin}
                    onChange={e => setAdminPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/40 text-zinc-900 dark:text-white font-mono tracking-widest text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-bold"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || lockoutSeconds > 0}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 ${
                lockoutSeconds > 0
                  ? 'bg-zinc-500 cursor-not-allowed opacity-60'
                  : isLoggingAsAdmin
                  ? 'bg-purple-600 hover:bg-purple-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {lockoutSeconds > 0
                  ? `Bloqueado temporalmente (${lockoutSeconds}s)`
                  : isSubmitting
                  ? 'Verificando credenciales...'
                  : isLoggingAsAdmin
                  ? 'Acceder como Administrador'
                  : 'Entrar a mi Cuenta'}
              </span>
            </button>

            <div className="pt-3 text-center border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-500">
                ¿Aún no tienes cuenta en LUDEX?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Crear cuenta gratis
                </button>
              </p>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
