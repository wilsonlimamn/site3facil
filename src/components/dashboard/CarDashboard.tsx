import React from 'react';
import { 
  Gauge, 
  Wrench, 
  Fuel, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Plus, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useCarContext } from '../../context/CarContext';

interface CarDashboardProps {
  onOpenUpdateKm: () => void;
  onOpenAddMaintenance: () => void;
  onOpenAddFuel: () => void;
  onOpenAddExpense: () => void;
  onNavigateToMaintenance: () => void;
  onNavigateToFuel: () => void;
  onNavigateToDrive: () => void;
  onQuickCompleteAlert: (ruleId: string, title: string) => void;
}

export const CarDashboard: React.FC<CarDashboardProps> = ({
  onOpenUpdateKm,
  onOpenAddMaintenance,
  onOpenAddFuel,
  onOpenAddExpense,
  onNavigateToMaintenance,
  onNavigateToFuel,
  onNavigateToDrive,
  onQuickCompleteAlert,
}) => {
  const { 
    selectedCar, 
    currentCarAlerts, 
    currentCarMaintenance, 
    currentCarFuel, 
    currentCarExpenses,
    notificationsEnabled,
    requestNotificationPermission
  } = useCarContext();

  if (!selectedCar) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 m-4">
        <p className="text-slate-400">Nenhum veículo selecionado.</p>
      </div>
    );
  }

  // Filter alerts for current car
  const criticalAlerts = currentCarAlerts.filter(a => a.status === 'vencido');
  const warningAlerts = currentCarAlerts.filter(a => a.status === 'atencao');

  // Stats calculations
  const totalFuelCost = currentCarFuel.reduce((sum, f) => sum + f.valorTotal, 0);
  const totalMaintCost = currentCarMaintenance.reduce((sum, m) => sum + m.custoTotal, 0);
  const totalExpCost = currentCarExpenses.reduce((sum, e) => sum + e.valor, 0);
  const totalGeneralCost = totalFuelCost + totalMaintCost + totalExpCost;

  // Average Km/L
  const fuelWithKml = currentCarFuel.filter(f => f.kmPorLitroCalculado && f.kmPorLitroCalculado > 0);
  const avgKml = fuelWithKml.length > 0
    ? (fuelWithKml.reduce((sum, f) => sum + (f.kmPorLitroCalculado || 0), 0) / fuelWithKml.length).toFixed(1)
    : '--';

  // Average Cost per KM
  const fuelWithCostKm = currentCarFuel.filter(f => f.custoPorKm && f.custoPorKm > 0);
  const avgCostKm = fuelWithCostKm.length > 0
    ? (fuelWithCostKm.reduce((sum, f) => sum + (f.custoPorKm || 0), 0) / fuelWithCostKm.length).toFixed(2)
    : '--';

  // Cost distribution for chart
  const costDistribution = [
    { name: 'Combustível', value: totalFuelCost, color: '#10b981' },
    { name: 'Manutenções', value: totalMaintCost, color: '#f59e0b' },
    { name: 'Despesas & IPVA', value: totalExpCost, color: '#8b5cf6' },
  ].filter(c => c.value > 0);

  // Fuel consumption history chart data
  const fuelChartData = [...currentCarFuel]
    .reverse()
    .slice(-7)
    .map(f => ({
      data: new Date(f.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      kml: f.kmPorLitroCalculado || null,
      valor: f.valorTotal,
      km: f.kmMomento,
    }));

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Top Status Banner (Vehicle Summary & KM) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Left: Car Details */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {selectedCar.apelido}
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                {selectedCar.placa}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {selectedCar.marca} {selectedCar.modelo} • Ano {selectedCar.ano} • {selectedCar.combustivel} • Cor {selectedCar.cor}
            </p>
            
            {/* Status Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {criticalAlerts.length > 0 ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>{criticalAlerts.length} Manutenção(ões) Vencida(s)</span>
                </div>
              ) : warningAlerts.length > 0 ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{warningAlerts.length} Manutenção(ões) Próxima(s)</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Todas as manutenções em dia</span>
                </div>
              )}

              {selectedCar.dataLicenciamento && (
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                  Licenciamento: {new Date(selectedCar.dataLicenciamento).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>

          {/* Right: Odometer Display & Fast Update Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Gauge className="h-3.5 w-3.5 text-blue-400" />
                <span>Odômetro Atual</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-wider mt-0.5">
                {selectedCar.kmAtual.toLocaleString('pt-BR')}{' '}
                <span className="text-sm font-normal text-slate-400">KM</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Média mensal: {selectedCar.kmMediaMensal.toLocaleString('pt-BR')} km/mês
              </div>
            </div>

            <button
              id="update-km-dashboard-btn"
              onClick={onOpenUpdateKm}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center space-x-2 whitespace-nowrap"
            >
              <Gauge className="h-4 w-4" />
              <span>Atualizar KM</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Notification Permission Banner if not enabled */}
      {!notificationsEnabled && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Receber Lembretes de Manutenção no Navegador</p>
              <p className="text-xs text-slate-400">Seja avisado quando uma revisão ou troca de óleo estiver próxima do vencimento.</p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition whitespace-nowrap border border-slate-600"
          >
            Ativar Notificações
          </button>
        </div>
      )}

      {/* 3. Alerts Section (Priority: Vencidos e Atenção) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Lembretes e Prazos do Seu Carro</span>
            </h2>
            {criticalAlerts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                {criticalAlerts.length} urgente(s)
              </span>
            )}
          </div>
          <button
            onClick={onNavigateToMaintenance}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>Ver cronograma completo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {currentCarAlerts.length === 0 ? (
          <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <p className="text-sm font-medium text-slate-200">Tudo em ordem com seu carro!</p>
            <p className="text-xs text-slate-400">Nenhum item com prazo vencido ou com limite próximo no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {currentCarAlerts.map((alert) => {
              const isCritical = alert.status === 'vencido';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition shadow-sm flex flex-col justify-between space-y-3 ${
                    isCritical
                      ? 'bg-rose-950/30 border-rose-800/80 text-rose-100'
                      : 'bg-amber-950/30 border-amber-800/80 text-amber-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {isCritical ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm text-white">{alert.titulo}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {isCritical ? 'Vencido' : 'Atenção'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {alert.descricao}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer with estimation & action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="text-slate-400">
                      {alert.dataEstimadaVencimento && (
                        <span>Estimativa: ~{new Date(alert.dataEstimadaVencimento).toLocaleDateString('pt-BR')}</span>
                      )}
                      {alert.kmLimite && (
                        <span className="font-mono ml-2">Limite: {alert.kmLimite.toLocaleString('pt-BR')} km</span>
                      )}
                    </div>

                    <button
                      onClick={() => onQuickCompleteAlert(alert.ruleId, alert.titulo)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition shadow-sm ${
                        isCritical 
                          ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      Registrar Feita
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. KPI Cards & Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Km/L Consumo */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Consumo Médio</span>
            <Fuel className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {avgKml} <span className="text-xs font-normal text-slate-400">km/L</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentCarFuel.length} abastecimentos registrados
          </div>
        </div>

        {/* Custo por KM */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Custo por KM</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            R$ {avgCostKm} <span className="text-xs font-normal text-slate-400">/km</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Baseado em combustível
          </div>
        </div>

        {/* Gasto Manutenção */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total em Manutenções</span>
            <Wrench className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            R$ {totalMaintCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentCarMaintenance.length} serviços realizados
          </div>
        </div>

        {/* Custo Geral */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Investimento Total</span>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            R$ {totalGeneralCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Combustível + Oficina + Taxas
          </div>
        </div>

      </div>

      {/* 5. Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fuel Efficiency History Chart */}
        <div className="lg:col-span-2 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Histórico de Rendimento (Km/L)</h3>
              <p className="text-xs text-slate-400">Eficiência dos últimos abastecimentos</p>
            </div>
            <button
              onClick={onOpenAddFuel}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Abastecer</span>
            </button>
          </div>

          {fuelChartData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelChartData}>
                  <defs>
                    <linearGradient id="kmlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="data" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value: any) => [`${value} km/L`, 'Rendimento']}
                  />
                  <Area type="monotone" dataKey="kml" stroke="#3b82f6" strokeWidth={2.5} fill="url(#kmlGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Fuel className="h-6 w-6 mb-1 text-slate-600" />
              <span>Nenhum abastecimento registrado ainda.</span>
            </div>
          )}
        </div>

        {/* Cost Distribution Chart */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Distribuição de Gastos</h3>
            <p className="text-xs text-slate-400">Total acumulado por categoria</p>
          </div>

          {costDistribution.length > 0 ? (
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
              Sem dados de despesas.
            </div>
          )}

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {costDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono text-slate-200">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. Recent Activity List (Last Maintenances & Fuelings) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Maintenances */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              <span>Últimas Manutenções Realizadas</span>
            </h3>
            <button
              onClick={onNavigateToMaintenance}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Ver todas
            </button>
          </div>

          {currentCarMaintenance.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhuma manutenção realizada registrada ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {currentCarMaintenance.slice(0, 3).map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-100">{m.titulo}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(m.dataRealizada).toLocaleDateString('pt-BR')} • {m.kmRealizado.toLocaleString('pt-BR')} km • {m.oficina || 'Oficina'}
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-amber-300">
                    R$ {m.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Fuelings */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Fuel className="h-4 w-4 text-emerald-400" />
              <span>Últimos Abastecimentos</span>
            </h3>
            <button
              onClick={onNavigateToFuel}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Ver todos
            </button>
          </div>

          {currentCarFuel.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhum abastecimento registrado ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {currentCarFuel.slice(0, 3).map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-100">{f.tipoCombustivel} • {f.litros}L</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(f.data).toLocaleDateString('pt-BR')} • {f.kmMomento.toLocaleString('pt-BR')} km • {f.posto || 'Posto'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-emerald-300">
                      R$ {f.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    {f.kmPorLitroCalculado && (
                      <div className="text-[10px] text-blue-400 font-mono">
                        {f.kmPorLitroCalculado} km/L
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
