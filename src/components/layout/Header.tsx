import React, { useState } from 'react';
import { 
  Car as CarIcon, 
  Bell, 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  Plus, 
  ChevronDown, 
  Gauge, 
  Wrench, 
  Fuel, 
  DollarSign, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface HeaderProps {
  onOpenUpdateKm: () => void;
  onOpenAddMaintenance: () => void;
  onOpenAddFuel: () => void;
  onOpenAddExpense: () => void;
  onOpenAddCar: () => void;
  onOpenDriveModal: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpdateKm,
  onOpenAddMaintenance,
  onOpenAddFuel,
  onOpenAddExpense,
  onOpenAddCar,
  onOpenDriveModal,
  onOpenNotifications,
}) => {
  const { 
    cars, 
    selectedCar, 
    selectedCarId, 
    setSelectedCarId, 
    user, 
    driveSync, 
    loginGoogle, 
    logoutGoogle, 
    syncWithGoogleDrive,
    criticalAlertsCount,
    warningAlertsCount,
    notificationsEnabled,
    requestNotificationPermission
  } = useCarContext();

  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const totalAlerts = criticalAlertsCount + warningAlertsCount;

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">CarControle</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Pessoal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestão individual, SQLite e Google Drive</p>
            </div>
          </div>

          {/* Center: Car Selector Pill */}
          <div className="relative">
            <button
              id="car-selector-btn"
              onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
              className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-sm font-medium transition text-white shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="max-w-[140px] sm:max-w-[200px] truncate">
                {selectedCar ? selectedCar.apelido : 'Nenhum carro'}
              </span>
              {selectedCar && (
                <span className="text-xs text-slate-400 font-mono hidden md:inline">
                  [{selectedCar.placa}]
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
            </button>

            {/* Car dropdown */}
            {isCarDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsCarDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                  Seus Veículos
                </div>
                {cars.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarId(car.id)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-sm transition ${
                      car.id === selectedCarId 
                        ? 'bg-blue-600/20 text-blue-300 font-medium border-l-2 border-blue-500' 
                        : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">{car.apelido}</div>
                      <div className="text-xs text-slate-400">{car.modelo} • {car.placa}</div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">
                      {car.kmAtual.toLocaleString('pt-BR')} km
                    </span>
                  </button>
                ))}
                
                <div className="p-2 border-t border-slate-700/60">
                  <button
                    onClick={onOpenAddCar}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-700/60 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Cadastrar Novo Carro</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Actions: Google Drive sync indicator, Notification Bell, Quick Add, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Google Drive Status Button */}
            <button
              id="google-drive-sync-btn"
              onClick={onOpenDriveModal}
              title={user ? (driveSync.lastSyncedAt ? 'Backup no Google Drive ativo' : 'Sincronizar com Google Drive') : 'Conectar Google Drive'}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                user && driveSync.isConnected
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {driveSync.isSyncing ? (
                <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin" />
              ) : user && driveSync.isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Cloud className="h-3.5 w-3.5 text-amber-400" />
              )}
              <span className="hidden md:inline">
                {driveSync.isSyncing ? 'Sincronizando...' : user ? 'Google Drive' : 'Conectar Drive'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              id="notifications-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
              title="Lembretes e Alertas de Manutenção"
            >
              <Bell className="h-4 w-4" />
              {criticalAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-bounce">
                  {criticalAlertsCount}
                </span>
              ) : warningAlertsCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 shadow-sm ring-2 ring-slate-900">
                  {warningAlertsCount}
                </span>
              ) : null}
            </button>

            {/* Quick Action Button with Dropdown */}
            <div className="relative">
              <button
                id="quick-add-action-btn"
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 transition"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Lançar</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isQuickActionOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsQuickActionOpen(false)}
                >
                  <button
                    onClick={onOpenUpdateKm}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs text-slate-200 hover:bg-slate-700/60 transition"
                  >
                    <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                      <Gauge className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium">Atualizar KM do Painel</div>
                      <div className="text-[10px] text-slate-400">Ajustar odômetro atual</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenAddMaintenance}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs text-slate-200 hover:bg-slate-700/60 transition"
                  >
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <Wrench className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium">Registrar Manutenção</div>
                      <div className="text-[10px] text-slate-400">Óleo, peças, filtros, revisão</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenAddFuel}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs text-slate-200 hover:bg-slate-700/60 transition"
                  >
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                      <Fuel className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium">Registrar Abastecimento</div>
                      <div className="text-[10px] text-slate-400">Cálculo de Km/L e consumo</div>
                    </div>
                  </button>

                  <button
                    onClick={onOpenAddExpense}
                    className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs text-slate-200 hover:bg-slate-700/60 transition"
                  >
                    <div className="p-1 rounded bg-purple-500/20 text-purple-400">
                      <DollarSign className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-medium">Outra Despesa</div>
                      <div className="text-[10px] text-slate-400">IPVA, Seguro, Lavagem, Pedágio</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Google User Avatar / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500 transition"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-700">
                      <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={onOpenDriveModal}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <Database className="h-3.5 w-3.5 text-blue-400" />
                      <span>Gerenciar Banco no Drive</span>
                    </button>

                    <button
                      onClick={async () => {
                        await logoutGoogle();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sair da Conta Google</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="google-login-header-btn"
                onClick={async () => {
                  try {
                    await loginGoogle();
                  } catch (e) {
                    // handled in context
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-sm transition"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden sm:inline">Entrar com Google</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
