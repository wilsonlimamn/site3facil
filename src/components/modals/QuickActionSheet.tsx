import React from 'react';
import { Gauge, Wrench, Fuel, DollarSign, X, Database, Plus } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateKm: () => void;
  onOpenAddMaintenance: () => void;
  onOpenAddFuel: () => void;
  onOpenAddExpense: () => void;
  onOpenDriveModal: () => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onOpenUpdateKm,
  onOpenAddMaintenance,
  onOpenAddFuel,
  onOpenAddExpense,
  onOpenDriveModal,
}) => {
  const { selectedCar } = useCarContext();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Atualizar Odômetro (KM)',
      description: `Atual KM: ${selectedCar?.kmAtual.toLocaleString('pt-BR') || 0} km`,
      icon: Gauge,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      onClick: () => {
        onClose();
        onOpenUpdateKm();
      },
    },
    {
      title: 'Registrar Abastecimento',
      description: 'Cálculo de autonomia e Km/Litro',
      icon: Fuel,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      onClick: () => {
        onClose();
        onOpenAddFuel();
      },
    },
    {
      title: 'Lançar Manutenção / Peça',
      description: 'Troca de óleo, filtros, correia, revisão',
      icon: Wrench,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      onClick: () => {
        onClose();
        onOpenAddMaintenance();
      },
    },
    {
      title: 'Outras Despesas',
      description: 'IPVA, seguro, pedágio, lavagem',
      icon: DollarSign,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      onClick: () => {
        onClose();
        onOpenAddExpense();
      },
    },
    {
      title: 'Sincronizar Google Drive',
      description: 'Salvar backup no seu Drive pessoal',
      icon: Database,
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      onClick: () => {
        onClose();
        onOpenDriveModal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Ação Rápida</h3>
            <p className="text-xs text-slate-400">
              {selectedCar ? `${selectedCar.apelido} (${selectedCar.placa})` : 'Selecione uma opção'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 py-2">
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                onClick={act.onClick}
                className="w-full flex items-center space-x-3.5 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition text-left active:scale-[0.99]"
              >
                <div className={`p-2.5 rounded-xl border ${act.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{act.title}</div>
                  <div className="text-xs text-slate-400 truncate">{act.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
