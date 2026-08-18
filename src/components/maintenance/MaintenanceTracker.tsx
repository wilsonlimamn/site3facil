import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  Gauge, 
  DollarSign, 
  Filter, 
  RotateCcw, 
  Check, 
  Info,
  Trash2,
  Edit3,
  Search,
  FileText
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { MaintenanceRule, MaintenanceRecord } from '../../types/car';

interface MaintenanceTrackerProps {
  onOpenAddRecord: (ruleId?: string, defaultTitle?: string) => void;
  onOpenAddRule: () => void;
}

export const MaintenanceTracker: React.FC<MaintenanceTrackerProps> = ({
  onOpenAddRecord,
  onOpenAddRule,
}) => {
  const { 
    selectedCar, 
    currentCarRules, 
    currentCarMaintenance, 
    alerts, 
    deleteMaintenanceRule,
    resetDefaultRulesForCar
  } = useCarContext();

  const [activeTab, setActiveTab] = useState<'cronograma' | 'historico'>('cronograma');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'vencido' | 'atencao' | 'em_dia'>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  if (!selectedCar) return null;

  // Calculate status for each rule
  const rulesWithStatus = currentCarRules.map((rule) => {
    const alert = alerts.find(a => a.ruleId === rule.id && a.carId === selectedCar.id);
    const status = alert ? alert.status : 'em_dia';
    const kmRestante = rule.proximoKmLimite ? rule.proximoKmLimite - selectedCar.kmAtual : undefined;
    
    return {
      rule,
      status,
      alert,
      kmRestante,
    };
  });

  // Filtered rules
  const filteredRules = rulesWithStatus.filter(({ rule, status }) => {
    if (filterStatus !== 'todos' && status !== filterStatus) return false;
    if (filterCategory !== 'todos' && rule.categoria !== filterCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        rule.titulo.toLowerCase().includes(q) ||
        (rule.descricao && rule.descricao.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories = [
    { id: 'todos', label: 'Todas as Categorias' },
    { id: 'motor', label: 'Motor e Filtros' },
    { id: 'freios', label: 'Freios' },
    { id: 'suspensao_pneus', label: 'Pneus e Suspensão' },
    { id: 'fluidos', label: 'Fluidos e Radiador' },
    { id: 'transmissao', label: 'Correias e Transmissão' },
    { id: 'eletrica', label: 'Elétrica e Bateria' },
    { id: 'documentacao', label: 'IPVA e Seguro' },
    { id: 'geral', label: 'Geral e Cabine' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Wrench className="h-6 w-6 text-amber-400" />
            <span>Manutenções & Cronograma Preventivo</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Controle de revisões por quilometragem (KM) e tempo para {selectedCar.apelido}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenAddRecord()}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <Check className="h-4 w-4" />
            <span>Registrar Manutenção Feita</span>
          </button>
          
          <button
            onClick={onOpenAddRule}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Item de Manutenção</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (Cronograma vs Histórico) */}
      <div className="flex items-center border-b border-slate-800 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('cronograma')}
          className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'cronograma'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Itens e Prazos do Cronograma ({currentCarRules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`pb-3 font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'historico'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Histórico de Serviços Realizados ({currentCarMaintenance.length})</span>
        </button>
      </div>

      {/* Content for Cronograma */}
      {activeTab === 'cronograma' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar item de revisão..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setFilterStatus('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterStatus === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({rulesWithStatus.length})
              </button>
              <button
                onClick={() => setFilterStatus('vencido')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterStatus === 'vencido' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                }`}
              >
                Vencidos ({rulesWithStatus.filter(r => r.status === 'vencido').length})
              </button>
              <button
                onClick={() => setFilterStatus('atencao')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterStatus === 'atencao' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
              >
                Atenção ({rulesWithStatus.filter(r => r.status === 'atencao').length})
              </button>
              <button
                onClick={() => setFilterStatus('em_dia')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  filterStatus === 'em_dia' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                Em Dia ({rulesWithStatus.filter(r => r.status === 'em_dia').length})
              </button>
            </div>

            {/* Category select */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-auto px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

          </div>

          {/* Rules Grid */}
          {filteredRules.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
              <p className="text-sm text-slate-400">Nenhum item de manutenção encontrado para os filtros selecionados.</p>
              <button
                onClick={() => resetDefaultRulesForCar(selectedCar.id)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition inline-flex items-center space-x-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Itens Padrão do Fabricante</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map(({ rule, status, alert, kmRestante }) => {
                const isExpired = status === 'vencido';
                const isWarning = status === 'atencao';

                // Calculate progress %
                let progressPercent = 0;
                if (rule.intervaloKm && rule.ultimoKmRealizado !== undefined) {
                  const kmSince = selectedCar.kmAtual - rule.ultimoKmRealizado;
                  progressPercent = Math.min(100, Math.max(0, Math.round((kmSince / rule.intervaloKm) * 100)));
                }

                return (
                  <div
                    key={rule.id}
                    className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-4 ${
                      isExpired
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : isWarning
                          ? 'bg-amber-950/20 border-amber-800/60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Header with Title and Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {rule.categoria}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">{rule.titulo}</h3>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            isExpired
                              ? 'bg-rose-600 text-white'
                              : isWarning
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isExpired ? 'Vencido' : isWarning ? 'Atenção' : 'Em Dia'}
                        </span>
                      </div>

                      {/* Description */}
                      {rule.descricao && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {rule.descricao}
                        </p>
                      )}

                      {/* Intervals and Limits */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Intervalo Recomendado</span>
                          <span className="font-medium text-slate-200">
                            {rule.intervaloKm ? `${rule.intervaloKm.toLocaleString('pt-BR')} km` : ''}
                            {rule.intervaloKm && rule.intervaloMeses ? ' ou ' : ''}
                            {rule.intervaloMeses ? `${rule.intervaloMeses} meses` : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[10px] block">Próximo Limite</span>
                          <span className="font-mono font-medium text-slate-200">
                            {rule.proximoKmLimite ? `${rule.proximoKmLimite.toLocaleString('pt-BR')} km` : 'Por data'}
                            {rule.proximaDataLimite ? ` (${new Date(rule.proximaDataLimite).toLocaleDateString('pt-BR')})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* KM Progress Bar */}
                      {rule.intervaloKm && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">
                              {kmRestante !== undefined && kmRestante <= 0 ? (
                                <span className="text-rose-400 font-semibold font-mono">
                                  Venceu há {Math.abs(kmRestante).toLocaleString('pt-BR')} km
                                </span>
                              ) : kmRestante !== undefined ? (
                                <span className="text-slate-300 font-mono">
                                  Faltam {kmRestante.toLocaleString('pt-BR')} km
                                </span>
                              ) : null}
                            </span>
                            <span className="text-slate-500 font-mono">{progressPercent}% do ciclo</span>
                          </div>
                          
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isExpired ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => deleteMaintenanceRule(rule.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Excluir regra"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onOpenAddRecord(rule.id, rule.titulo)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                          isExpired
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                            : isWarning
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Registrar como Feita</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Content for Histórico */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          {currentCarMaintenance.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
              <p className="text-sm text-slate-400">Nenhum registro de manutenção realizada para este carro.</p>
              <button
                onClick={() => onOpenAddRecord()}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
              >
                Registrar Primeira Manutenção
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentCarMaintenance.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                        {record.tipo}
                      </span>
                      <h4 className="text-sm font-bold text-white">{record.titulo}</h4>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{new Date(record.dataRealizada).toLocaleDateString('pt-BR')}</span>
                      </span>

                      <span className="flex items-center space-x-1 font-mono">
                        <Gauge className="h-3.5 w-3.5 text-slate-500" />
                        <span>{record.kmRealizado.toLocaleString('pt-BR')} km</span>
                      </span>

                      {record.oficina && (
                        <span className="text-slate-300">
                          Oficina: {record.oficina}
                        </span>
                      )}

                      {record.comprovanteNota && (
                        <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Doc: {record.comprovanteNota}
                        </span>
                      )}
                    </div>

                    {record.observacoes && (
                      <p className="text-xs text-slate-400 italic pt-1">
                        "{record.observacoes}"
                      </p>
                    )}
                  </div>

                  {/* Right Cost */}
                  <div className="text-right bg-slate-950/60 p-3 rounded-lg border border-slate-800 min-w-[140px]">
                    <div className="text-[10px] uppercase text-slate-500">Valor Total</div>
                    <div className="text-base font-bold font-mono text-amber-300">
                      R$ {record.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {(record.custoPecas > 0 || record.custoMaoDeObra > 0) && (
                      <div className="text-[10px] text-slate-400">
                        Peças: R$ {record.custoPecas.toFixed(0)} | M.O: R$ {record.custoMaoDeObra.toFixed(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
