import React, { useState, useEffect } from 'react';
import { DollarSign, X, Check, Calendar, Tag } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { ExpenseCategory } from '../../types/car';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { selectedCar, addExpenseRecord } = useCarContext();

  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<ExpenseCategory>('ipva_licenciamento');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [valor, setValor] = useState<number>(0);
  const [kmMomento, setKmMomento] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (selectedCar && isOpen) {
      setKmMomento(selectedCar.kmAtual);
      setData(new Date().toISOString().split('T')[0]);
      setDescricao('');
      setValor(0);
      setObservacoes('');
    }
  }, [selectedCar, isOpen]);

  if (!isOpen || !selectedCar) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || valor <= 0) {
      alert('Por favor, informe a descrição e o valor da despesa.');
      return;
    }

    addExpenseRecord({
      carId: selectedCar.id,
      descricao: descricao.trim(),
      categoria,
      data,
      valor: Number(valor),
      kmMomento: kmMomento ? Number(kmMomento) : undefined,
      observacoes: observacoes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lançar Despesa / Taxa</h3>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Categoria da Despesa
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ipva_licenciamento">IPVA / Licenciamento Anual</option>
              <option value="seguro">Seguro Auto / Franquia</option>
              <option value="lavagem">Lavagem & Estética Automotiva</option>
              <option value="pedagio">Pedágio / Tag</option>
              <option value="estacionamento">Estacionamento / Garagem</option>
              <option value="multa">Multa de Trânsito</option>
              <option value="acessorios">Acessórios / Som / Película</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição da Despesa *
            </label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Parcela 01 IPVA 2025, Lavagem Completa, Tag Sem Parar..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Value & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={valor || ''}
                onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="w-full px-3 py-2 bg-slate-950 border border-purple-500/50 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Pagamento
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Pago via Pix com 3% de desconto à vista"
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
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Despesa</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
