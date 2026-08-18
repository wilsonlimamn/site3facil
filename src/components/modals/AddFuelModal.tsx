import React, { useState, useEffect } from 'react';
import { Fuel, X, Check, DollarSign, Calendar, Gauge, MapPin } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({ isOpen, onClose }) => {
  const { selectedCar, addFuelRecord } = useCarContext();

  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kmMomento, setKmMomento] = useState<number>(0);
  const [tipoCombustivel, setTipoCombustivel] = useState<string>('Gasolina Comum');
  const [litros, setLitros] = useState<number>(0);
  const [precoPorLitro, setPrecoPorLitro] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [posto, setPosto] = useState<string>('');
  const [tanqueCheio, setTanqueCheio] = useState<boolean>(true);
  const [observacoes, setObservacoes] = useState<string>('');

  useEffect(() => {
    if (selectedCar && isOpen) {
      setKmMomento(selectedCar.kmAtual);
      setData(new Date().toISOString().split('T')[0]);
      setPosto('');
      setObservacoes('');
      setLitros(0);
      setPrecoPorLitro(5.89);
      setValorTotal(0);
    }
  }, [selectedCar, isOpen]);

  if (!isOpen || !selectedCar) return null;

  const handleLitersChange = (l: number) => {
    setLitros(l);
    if (precoPorLitro > 0) {
      setValorTotal(parseFloat((l * precoPorLitro).toFixed(2)));
    }
  };

  const handlePricePerLiterChange = (p: number) => {
    setPrecoPorLitro(p);
    if (litros > 0) {
      setValorTotal(parseFloat((litros * p).toFixed(2)));
    }
  };

  const handleTotalChange = (tot: number) => {
    setValorTotal(tot);
    if (litros > 0) {
      setPrecoPorLitro(parseFloat((tot / litros).toFixed(3)));
    } else if (precoPorLitro > 0) {
      setLitros(parseFloat((tot / precoPorLitro).toFixed(2)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valorTotal <= 0 || litros <= 0) {
      alert('Por favor, informe a quantidade de litros e o valor do abastecimento.');
      return;
    }

    addFuelRecord({
      carId: selectedCar.id,
      data,
      kmMomento: Number(kmMomento) || selectedCar.kmAtual,
      tipoCombustivel,
      litros: Number(litros),
      precoPorLitro: Number(precoPorLitro) || (Number(valorTotal) / Number(litros)),
      valorTotal: Number(valorTotal),
      posto: posto.trim(),
      tanqueCheio,
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
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Abastecimento</h3>
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
          
          {/* Fuel Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Combustível
              </label>
              <select
                value={tipoCombustivel}
                onChange={(e) => setTipoCombustivel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Gasolina Comum">Gasolina Comum</option>
                <option value="Gasolina Aditivada">Gasolina Aditivada</option>
                <option value="Gasolina Premium">Gasolina Premium (Podium / Octapro)</option>
                <option value="Etanol">Etanol (Álcool)</option>
                <option value="Diesel S10">Diesel S10</option>
                <option value="Diesel S500">Diesel S500</option>
                <option value="GNV">GNV (Gás Natural)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Abastecimento
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

          {/* KM and Station */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Quilometragem no Momento *
              </label>
              <input
                type="number"
                min="0"
                required
                value={kmMomento || ''}
                onChange={(e) => setKmMomento(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Atualiza o odômetro do veículo se for maior.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Posto / Rede
              </label>
              <input
                type="text"
                value={posto}
                onChange={(e) => setPosto(e.target.value)}
                placeholder="Ex: Shell, Ipiranga, Petrobras..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quantities and Cost Calculations */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Litros e Valores</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Litros (L) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={litros || ''}
                  onChange={(e) => handleLitersChange(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 40.5"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Preço / Litro (R$)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.01"
                  value={precoPorLitro || ''}
                  onChange={(e) => handlePricePerLiterChange(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5.89"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-400 font-semibold mb-1">Total Pago (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={valorTotal || ''}
                  onChange={(e) => handleTotalChange(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 238.50"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tanque Cheio Checkbox */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
              <input
                type="checkbox"
                id="tanqueCheioCheck"
                checked={tanqueCheio}
                onChange={(e) => setTanqueCheio(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
              />
              <label htmlFor="tanqueCheioCheck" className="text-xs text-slate-300 cursor-pointer">
                Completou o tanque (necessário para calcular a média de <strong>Km/L</strong> com precisão)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações
            </label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Uso 100% urbano com ar condicionado ligado."
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
              <span>Salvar Abastecimento</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
