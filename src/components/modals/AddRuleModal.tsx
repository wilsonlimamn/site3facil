import React, { useState } from 'react';
import { Wrench, X, Check, Clock, Gauge } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { MaintenanceCategory } from '../../types/car';

interface AddRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRuleModal: React.FC<AddRuleModalProps> = ({ isOpen, onClose }) => {
  const { selectedCar, addMaintenanceRule } = useCarContext();

  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<MaintenanceCategory>('motor');
  const [descricao, setDescricao] = useState('');
  const [intervaloKm, setIntervaloKm] = useState<number>(10000);
  const [intervaloMeses, setIntervaloMeses] = useState<number>(12);
  const [avisoPrevioKm, setAvisoPrevioKm] = useState<number>(1000);
  const [avisoPrevioDias, setAvisoPrevioDias] = useState<number>(30);
  const [ultimoKmRealizado, setUltimoKmRealizado] = useState<number>(0);
  const [ultimaDataRealizada, setUltimaDataRealizada] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen || !selectedCar) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Por favor, informe o título da regra de manutenção.');
      return;
    }

    addMaintenanceRule({
      carId: selectedCar.id,
      titulo: titulo.trim(),
      categoria,
      descricao: descricao.trim(),
      intervaloKm: Number(intervaloKm) > 0 ? Number(intervaloKm) : undefined,
      intervaloMeses: Number(intervaloMeses) > 0 ? Number(intervaloMeses) : undefined,
      alertaKmAntecedencia: Number(avisoPrevioKm) || 1000,
      alertaDiasAntecedencia: Number(avisoPrevioDias) || 30,
      ultimoKmRealizado: Number(ultimoKmRealizado) || selectedCar.kmAtual,
      ultimaDataRealizada: ultimaDataRealizada || undefined,
      proximoKmLimite: (Number(ultimoKmRealizado) || selectedCar.kmAtual) + (Number(intervaloKm) || 0),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Novo Item de Manutenção Periódica</h3>
              <p className="text-xs text-slate-400">Defina o prazo de validade por KM e/ou meses</p>
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
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Item / Revisão *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Troca de Pastilhas de Freio"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as MaintenanceCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="motor">Motor e Filtros</option>
                <option value="freios">Freios</option>
                <option value="suspensao_pneus">Pneus & Suspensão</option>
                <option value="fluidos">Fluidos & Radiador</option>
                <option value="transmissao">Correias & Câmbio</option>
                <option value="eletrica">Elétrica & Bateria</option>
                <option value="documentacao">IPVA & Seguro</option>
                <option value="geral">Geral</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Especificação Técnica / Observações
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Verificar espessura mínima de 3mm e discos."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Intervals */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Periodicidade Recomendada</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">A cada quantos KM</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={intervaloKm || ''}
                  onChange={(e) => setIntervaloKm(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 10000"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">A cada quantos Meses</label>
                <input
                  type="number"
                  min="0"
                  value={intervaloMeses || ''}
                  onChange={(e) => setIntervaloMeses(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 12"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-[11px] text-amber-400 mb-1">Avisar com antecedência (KM)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={avisoPrevioKm}
                  onChange={(e) => setAvisoPrevioKm(parseInt(e.target.value) || 1000)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-400 mb-1">Avisar com antecedência (Dias)</label>
                <input
                  type="number"
                  min="0"
                  value={avisoPrevioDias}
                  onChange={(e) => setAvisoPrevioDias(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Last performed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Última vez realizada (KM)
              </label>
              <input
                type="number"
                min="0"
                value={ultimoKmRealizado || selectedCar.kmAtual}
                onChange={(e) => setUltimoKmRealizado(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Última data realizada
              </label>
              <input
                type="date"
                value={ultimaDataRealizada}
                onChange={(e) => setUltimaDataRealizada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Criar Item de Cronograma</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
