import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Fuel, 
  DollarSign, 
  Car, 
  Database, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

export type TabType = 'dashboard' | 'manutencao' | 'abastecimento' | 'despesas' | 'veiculos' | 'drive_sqlite' | 'deploy_docker';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onChangeTab }) => {
  const { currentCarAlerts, criticalAlertsCount, warningAlertsCount } = useCarContext();

  const currentCarCritical = currentCarAlerts.filter(a => a.status === 'vencido').length;
  const currentCarWarning = currentCarAlerts.filter(a => a.status === 'atencao').length;

  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: { count: number; type: 'critical' | 'warning' } }[] = [
    { 
      id: 'dashboard', 
      label: 'Visão Geral', 
      icon: LayoutDashboard 
    },
    { 
      id: 'manutencao', 
      label: 'Manutenções e Alertas', 
      icon: Wrench,
      badge: currentCarCritical > 0 
        ? { count: currentCarCritical, type: 'critical' } 
        : currentCarWarning > 0 
          ? { count: currentCarWarning, type: 'warning' } 
          : undefined
    },
    { 
      id: 'abastecimento', 
      label: 'Abastecimento e Km/L', 
      icon: Fuel 
    },
    { 
      id: 'despesas', 
      label: 'Despesas e IPVA', 
      icon: DollarSign 
    },
    { 
      id: 'veiculos', 
      label: 'Meus Carros', 
      icon: Car 
    },
    { 
      id: 'drive_sqlite', 
      label: 'Google Drive e SQLite', 
      icon: Database 
    },
    { 
      id: 'deploy_docker', 
      label: 'Guia Docker & Cloud Run', 
      icon: Terminal 
    },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-16 z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.badge.type === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {tab.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
