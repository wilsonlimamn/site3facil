import React, { useState, useEffect } from 'react';
import { Wrench, X, Check, DollarSign, Calendar, Gauge, Store, FileText } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { MaintenanceType } from '../../types/car';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRuleId?: string;
  initialTitle?: string;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  initialRuleId,
  initialTitle,
}) => {
  const { selectedCar, currentCarRules, addMaintenanceRecord } = useCarContext();

  const [ruleId, setRuleId] = useState<string>('');
  const [titulo, setTitulo] = useState<string>('');
  const [tipo, setTipo] = useState<MaintenanceType>('preventiva');
  const [dataRealizada, setDataRealizada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kmRealizado, setKmRealizado] = useState<number>(0);
  const [oficina, setOficina] = useState<string>('');
  const [custoPecas, setCustoPecas] = useState<number>(0);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState<number>(0);
  const [comprovanteNota, setComprovanteNota] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (selectedCar && isOpen) {
      setKmRealizado(selectedCar.kmAtual);
      setDataRealizada(new Date().toISOString().split('T')[0]);
      
      if (initialRuleId) {
        setRuleId(initialRuleId);
        const rule = currentCarRules.find(r => r.id === initialRuleId);
        if (rule) setTitulo(rule.titulo);
      } else if (initialTitle) {
        setTitulo(initialTitle);
        const rule = currentCarRules.find(r => r.titulo.toLowerCase() === initialTitle.toLowerCase());
        if (rule) setRuleId(rule.id);
      } else if (currentCarRules.length > 0) {
        setRuleId(currentCarRules[0].id);
        setTitulo(currentCarRules[0].titulo);
      }
    }
  }, [selectedCar, isOpen, initialRuleId, initialTitle, currentCarRules]);

  if (!isOpen || !selectedCar) return null;

  const handleRuleChange = (selectedId: string) => {
    setRuleId(selectedId);
    if (selectedId === 'custom') {
      setTitulo('');
    } else {
      const found = currentCarRules.find(r => r.id === selectedId);
      if (found) setTitulo(found.titulo);
    }
  };

  const totalCalculated = (Number(custoPecas) || 0) + (Number(custoMaoDeObra) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Por favor, informe a descrição do serviço.');
      return;
    }

    addMaintenanceRecord({
      carId: selectedCar.id,
      ruleId: ruleId === 'custom' ? undefined : ruleId,
      titulo: titulo.trim(),
      tipo,
      dataRealizada,
      kmRealizado: Number(kmRealizado) || selectedCar.kmAtual,
      custoPecas: Number(custoPecas) || 0,
      custoMaoDeObra: Number(custoMaoDeObra) || 0,
      custoTotal: totalCalculated,
      oficina: oficina.trim(),
      comprovanteNota: comprovanteNota.trim(),
      observacoes: observacoes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Manutenção Realizada</h3>
              <p className="text-xs text-slate-400">{selectedCar.apelido} • {selectedCar.placa}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Rule Selector / Linkage */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Item do Cronograma para Atualizar
            </label>
            <select
              value={ruleId}
              onChange={(e) => handleRuleChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="custom">-- Serviço Avulso / Não listado --</option>
              {currentCarRules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titulo} ({r.categoria})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Ao vincular a um item do cronograma, o próximo vencimento em KM e data será automaticamente recalculado.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição do Serviço Realizado *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Troca de Óleo 5W30 Sintético + Filtro de Óleo"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type, Date and KM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="estetica">Estética</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Serviço
              </label>
              <input
                type="date"
                required
                value={dataRealizada}
                onChange={(e) => setDataRealizada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                KM no Momento
              </label>
              <input
                type="number"
                min="0"
                required
                value={kmRealizado || ''}
                onChange={(e) => setKmRealizado(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Workshop and Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Oficina / Estabelecimento
              </label>
              <input
                type="text"
                value={oficina}
                onChange={(e) => setOficina(e.target.value)}
                placeholder="Ex: Auto Mecânica São Paulo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Comprovante / Nº NF
              </label>
              <input
                type="text"
                value={comprovanteNota}
                onChange={(e) => setComprovanteNota(e.target.value)}
                placeholder="Ex: NF-e 45892"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Costs */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
            <span className="text-xs font-semibold text-slate-300 block">Valores do Serviço</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Peças (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={custoPecas || ''}
                  onChange={(e) => setCustoPecas(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mão de Obra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={custoMaoDeObra || ''}
                  onChange={(e) => setCustoMaoDeObra(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-400 font-semibold mb-1">Total (R$)</label>
                <div className="px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300">
                  R$ {totalCalculated.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações / Detalhes das Peças
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Utilizado óleo 100% sintético API SP e filtro Fram."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Registro</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
