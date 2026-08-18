import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  PlusCircle, 
  Fuel, 
  Menu
} from 'lucide-react';
import { TabType } from './NavigationTabs';
import { useCarContext } from '../../context/CarContext';

interface MobileBottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAction: () => void;
  onOpenNotifications: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAction,
}) => {
  const { currentCarAlerts } = useCarContext();
  const alertsCount = currentCarAlerts.filter(a => a.status === 'vencido' || a.status === 'atencao').length;

  return (
    <div 
      id="mobile-bottom-nav" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden px-2 py-1.5 safe-area-pb"
    >
      <div className="flex items-center justify-around">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition min-w-[56px] ${
            activeTab === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="h-5 w-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* 2. Manutenção */}
        <button
          onClick={() => onChangeTab('manutencao')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition min-w-[56px] ${
            activeTab === 'manutencao' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="h-5 w-5 mb-0.5" />
          <span>Revisões</span>
          {alertsCount > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>

        {/* 3. Central Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex flex-col items-center justify-center -mt-4 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 ring-4 ring-slate-950 transition active:scale-95"
          title="Lançamento Rápido"
        >
          <PlusCircle className="h-6 w-6" />
        </button>

        {/* 4. Abastecimento */}
        <button
          onClick={() => onChangeTab('abastecimento')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition min-w-[56px] ${
            activeTab === 'abastecimento' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Fuel className="h-5 w-5 mb-0.5" />
          <span>Abastecer</span>
        </button>

        {/* 5. More (Cars & Drive) */}
        <button
          onClick={() => {
            if (activeTab === 'veiculos' || activeTab === 'drive_sqlite' || activeTab === 'despesas') {
              onChangeTab('drive_sqlite');
            } else {
              onChangeTab('despesas');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition min-w-[56px] ${
            ['despesas', 'veiculos', 'drive_sqlite', 'deploy_docker'].includes(activeTab) 
              ? 'text-blue-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>Mais</span>
        </button>

      </div>
    </div>
  );
};
