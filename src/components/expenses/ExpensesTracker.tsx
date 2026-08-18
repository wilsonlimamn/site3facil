import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { ExpenseCategory } from '../../types/car';

interface ExpensesTrackerProps {
  onOpenAddExpense: () => void;
}

export const ExpensesTracker: React.FC<ExpensesTrackerProps> = ({ onOpenAddExpense }) => {
  const { selectedCar, currentCarExpenses, deleteExpenseRecord } = useCarContext();

  const [categoryFilter, setCategoryFilter] = useState<string>('todos');

  if (!selectedCar) return null;

  const totalExpenses = currentCarExpenses.reduce((sum, e) => sum + e.valor, 0);

  const filteredExpenses = currentCarExpenses.filter(e => {
    if (categoryFilter !== 'todos' && e.categoria !== categoryFilter) return false;
    return true;
  });

  const getCategoryBadge = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'ipva_licenciamento':
        return { label: 'IPVA / Licenciamento', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
      case 'seguro':
        return { label: 'Seguro Auto', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'lavagem':
        return { label: 'Lavagem & Estética', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' };
      case 'pedagio':
        return { label: 'Pedágio', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
      case 'estacionamento':
        return { label: 'Estacionamento', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' };
      case 'multa':
        return { label: 'Multa de Trânsito', color: 'bg-rose-500/20 text-rose-300 border-rose-400/30' };
      case 'acessorios':
        return { label: 'Acessórios & Upgrades', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
      default:
        return { label: 'Outros', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-purple-400" />
            <span>Despesas & Documentação</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Controle de IPVA, seguro, lavagens, pedágios e taxas para {selectedCar.apelido}
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Lançar Nova Despesa</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Total em Despesas & Taxas</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-300 mt-1">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filtrar:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="todos">Todas as Despesas</option>
            <option value="ipva_licenciamento">IPVA e Licenciamento</option>
            <option value="seguro">Seguro</option>
            <option value="lavagem">Lavagem</option>
            <option value="pedagio">Pedágio</option>
            <option value="estacionamento">Estacionamento</option>
            <option value="multa">Multa</option>
            <option value="acessorios">Acessórios</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <DollarSign className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">Nenhuma despesa avulsa registrada para esta categoria.</p>
          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition"
          >
            Registrar Despesa
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const badge = getCategoryBadge(exp.categoria);
            return (
              <div
                key={exp.id}
                className="bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{exp.descricao}</h4>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(exp.data).toLocaleDateString('pt-BR')}</span>
                    </span>
                    {exp.kmMomento && (
                      <span className="font-mono text-slate-400">
                        {exp.kmMomento.toLocaleString('pt-BR')} km
                      </span>
                    )}
                  </div>

                  {exp.observacoes && (
                    <p className="text-xs text-slate-400 italic">
                      "{exp.observacoes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-purple-300">
                      R$ {exp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este registro de despesa?')) {
                        deleteExpenseRecord(exp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Excluir despesa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
