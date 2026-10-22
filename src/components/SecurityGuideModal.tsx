import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  Disc,
  Cpu,
  MapPin,
  CheckCircle,
  FileCheck2,
  Lock
} from 'lucide-react';

export const SecurityGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setActiveTab } = useApp();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Protocolo Oficial de Seguridad LUDEX
              </h3>
              <p className="text-xs text-zinc-500">
                Guía anti-fraude y verificación física para tratos presenciales
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Golden Rule Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
              Regla Esencial: Trato y Pago 100% Presencial
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              En LUDEX no existen pasarelas de pago remoto intermedias. Todos los pagos se realizan <strong>en mano (efectivo revisado o Bizum in situ)</strong> únicamente tras examinar el videojuego cara a cara. Jamás aceptes transferencias adelantadas ni enlaces de transportistas externos.
            </p>
          </div>
        </div>

        {/* 4 Pillars of Physical Verification */}
        <div className="space-y-4 text-xs">
          
          {/* Pillar 1: Disc Inspection */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
              <Disc className="w-4 h-4 text-blue-500" />
              1. Inspección de Discos Ópticos (PS5, PS4, PS2, Xbox, PC)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1 leading-relaxed">
              <li><strong>Contraluz con linterna móvil:</strong> Inclina el disco para buscar rayas circulares producidas por lentes de consola o grietas en el anillo plástico central.</li>
              <li><strong>Capa protectora Blu-ray:</strong> Los discos de PS4/PS5 cuentan con capa <em>Durabis</em> resistente; desconfía si presentan manchas opacas o pulidos abrasivos manuales.</li>
              <li><strong>Comprobación de código IFPI:</strong> Revisa el holograma y el micro-código en la zona transparente del anillo interior.</li>
            </ul>
          </div>

          {/* Pillar 2: Retro Cartridge Inspection */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-purple-500" />
              2. Verificación de Cartuchos Retro (Nintendo Switch, GBA, N64)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300 pl-1 leading-relaxed">
              <li><strong>Contactos dorados limpios:</strong> Los pines de la placa base deben presentar brillo dorado uniforme sin corrosión verde ni óxido.</li>
              <li><strong>Troquelado de fábrica:</strong> En cartuchos de Game Boy y N64 auténticos se aprecia un número de dos dígitos troquelado bajo relieve en la pegatina frontal.</li>
              <li><strong>Tornillo original de seguridad:</strong> Las reproducciones piratas suelen usar tornillos Philips de estrella; los cartuchos originales emplean tornillos Gamebit o Tri-wing.</li>
            </ul>
          </div>

          {/* Pillar 3: Safe Spots */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              3. Lugares de Encuentro Seguros Recomendados
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Queda preferiblemente en estaciones de tren/metro céntricas (Atocha, Sants, Nuevos Ministerios), vestíbulos vigilados de centros comerciales (Fnac, El Corte Inglés) o cafeterías con afluencia pública de día. Evita callejones desolados o portales privados.
            </p>
          </div>

          {/* Pillar 4: Mutual Confirmation */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              4. Aprobación Dual de Entrega y Cobro en la App
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Una vez intercambiado el juego y el dinero en mano, el vendedor pulsa el botón <strong>"Aprobar Entrega y Cobro Presencial"</strong> en su aplicación. Esto genera de inmediato el certificado de auditoría digital inmutable y permite valorar la experiencia.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
