import React from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Gauge, 
  Zap, 
  Check 
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickCompleteAlert: (ruleId: string, title: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onQuickCompleteAlert,
}) => {
  const { 
    alerts, 
    cars, 
    notificationsEnabled, 
    requestNotificationPermission 
  } = useCarContext();

  if (!isOpen) return null;

  const criticalAlerts = alerts.filter(a => a.status === 'vencido');
  const warningAlerts = alerts.filter(a => a.status === 'atencao');

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Central de Alertas & Prazos</h3>
              <p className="text-xs text-slate-400">Lembretes de revisões e vencimentos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Web Push Notification Toggle */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Zap className={`h-4 w-4 ${notificationsEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Notificações do Navegador</div>
              <div className="text-[11px] text-slate-400">
                {notificationsEnabled ? 'Lembretes automáticos ativados' : 'Permitir avisos automáticos'}
              </div>
            </div>
          </div>

          {!notificationsEnabled && (
            <button
              onClick={requestNotificationPermission}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
            >
              Ativar
            </button>
          )}
        </div>

        {/* List of Alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {alerts.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-white">Nenhum alerta pendente</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Todas as manutenções e documentações dos seus veículos estão em dia!
              </p>
            </div>
          ) : (
            <>
              {/* Critical */}
              {criticalAlerts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Vencidos ({criticalAlerts.length})</span>
                  </div>

                  {criticalAlerts.map((alert) => {
                    const car = cars.find(c => c.id === alert.carId);
                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/80 text-rose-100 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded">
                              {car?.apelido || 'Veículo'} • {car?.placa}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{alert.titulo}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-rose-200/90 leading-relaxed">
                          {alert.descricao}
                        </p>

                        <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between">
                          <span className="text-[11px] text-rose-300 font-mono">
                            {alert.kmLimite && `Limite: ${alert.kmLimite.toLocaleString('pt-BR')} km`}
                          </span>

                          <button
                            onClick={() => {
                              onQuickCompleteAlert(alert.ruleId, alert.titulo);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Registrar Feita</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Warning */}
              {warningAlerts.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Próximos do Vencimento ({warningAlerts.length})</span>
                  </div>

                  {warningAlerts.map((alert) => {
                    const car = cars.find(c => c.id === alert.carId);
                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/80 text-amber-100 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded">
                              {car?.apelido || 'Veículo'} • {car?.placa}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1">{alert.titulo}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-amber-200/90 leading-relaxed">
                          {alert.descricao}
                        </p>

                        <div className="pt-2 border-t border-amber-900/60 flex items-center justify-between">
                          <span className="text-[11px] text-amber-300 font-mono">
                            {alert.kmLimite && `Limite: ${alert.kmLimite.toLocaleString('pt-BR')} km`}
                          </span>

                          <button
                            onClick={() => {
                              onQuickCompleteAlert(alert.ruleId, alert.titulo);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition flex items-center space-x-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Registrar Feita</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
