import React, { useState, useEffect } from 'react';
import { Car as CarIcon, X, Check, Gauge, Calendar, Shield } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { Car } from '../../types/car';

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  carToEdit?: Car | null;
}

export const CarModal: React.FC<CarModalProps> = ({ isOpen, onClose, carToEdit }) => {
  const { addCar, updateCar } = useCarContext();

  const [apelido, setApelido] = useState('');
  const [marca, setMarca] = useState('Honda');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('Prata');
  const [combustivel, setCombustivel] = useState('Flex (Gasolina/Etanol)');
  const [kmAtual, setKmAtual] = useState<number>(0);
  const [kmMediaMensal, setKmMediaMensal] = useState<number>(1000);
  const [dataLicenciamento, setDataLicenciamento] = useState('');
  const [dataSeguro, setDataSeguro] = useState('');

  useEffect(() => {
    if (carToEdit && isOpen) {
      setApelido(carToEdit.apelido);
      setMarca(carToEdit.marca);
      setModelo(carToEdit.modelo);
      setAno(carToEdit.ano);
      setPlaca(carToEdit.placa);
      setCor(carToEdit.cor);
      setCombustivel(carToEdit.combustivel);
      setKmAtual(carToEdit.kmAtual);
      setKmMediaMensal(carToEdit.kmMediaMensal || 1000);
      setDataLicenciamento(carToEdit.dataLicenciamento || '');
      setDataSeguro(carToEdit.dataSeguro || '');
    } else if (isOpen) {
      setApelido('');
      setMarca('Honda');
      setModelo('');
      setAno(new Date().getFullYear());
      setPlaca('');
      setCor('Cinza');
      setCombustivel('Flex (Gasolina/Etanol)');
      setKmAtual(45000);
      setKmMediaMensal(1000);
      setDataLicenciamento('');
      setDataSeguro('');
    }
  }, [carToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apelido.trim() || !modelo.trim() || !placa.trim()) {
      alert('Por favor, preencha o apelido, modelo e a placa do veículo.');
      return;
    }

    if (carToEdit) {
      updateCar({
        ...carToEdit,
        apelido: apelido.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        placa: placa.toUpperCase().trim(),
        cor: cor.trim(),
        combustivel,
        kmAtual: Number(kmAtual),
        kmMediaMensal: Number(kmMediaMensal) || 1000,
        dataLicenciamento: dataLicenciamento || undefined,
        dataVencimentoSeguro: dataSeguro || undefined,
      });
    } else {
      addCar({
        apelido: apelido.trim(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        placa: placa.toUpperCase().trim(),
        cor: cor.trim(),
        combustivel,
        kmAtual: Number(kmAtual) || 0,
        kmMediaMensal: Number(kmMediaMensal) || 1000,
        dataLicenciamento: dataLicenciamento || undefined,
        dataVencimentoSeguro: dataSeguro || undefined,
      });
    }

    onClose();
  };

  const marcasComuns = [
    'Honda', 'Toyota', 'Volkswagen', 'Chevrolet', 'Fiat', 'Hyundai', 
    'Ford', 'Renault', 'Jeep', 'Nissan', 'BMW', 'Mercedes-Benz', 
    'Audi', 'BYD', 'GWM', 'Caoa Chery', 'Peugeot', 'Citroën', 'Mitsubishi', 'Outra'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <CarIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {carToEdit ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
              </h3>
              <p className="text-xs text-slate-400">Gestão individual e cronograma personalizado</p>
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
          
          {/* Apelido & Placa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome / Apelido do Carro *
              </label>
              <input
                type="text"
                required
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Ex: Meu Civic, HB20 Prata..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Placa do Veículo *
              </label>
              <input
                type="text"
                required
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ex: ABC1D23 ou ABC-1234"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Marca, Modelo e Ano */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Marca
              </label>
              <select
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {marcasComuns.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Modelo / Versão *
              </label>
              <input
                type="text"
                required
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: Civic 2.0 EXL"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ano Fabricação
              </label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear() + 2}
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value) || 2020)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Combustível & Cor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo de Combustível
              </label>
              <select
                value={combustivel}
                onChange={(e) => setCombustivel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Flex (Gasolina/Etanol)">Flex (Gasolina/Etanol)</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Etanol">Etanol</option>
                <option value="Diesel">Diesel</option>
                <option value="Híbrido (HEV/PHEV)">Híbrido</option>
                <option value="100% Elétrico (BEV)">100% Elétrico</option>
                <option value="GNV">GNV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cor
              </label>
              <input
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="Ex: Preto, Prata, Branco..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Odometer & Projections */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">Hodômetro & Média de Rodagem</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-blue-400 font-semibold mb-1">
                  Hodômetro Atual (KM) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={kmAtual || ''}
                  onChange={(e) => setKmAtual(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 45000"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-blue-500/50 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Média Estimada (KM/mês)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={kmMediaMensal || ''}
                  onChange={(e) => setKmMediaMensal(parseInt(e.target.value) || 1000)}
                  placeholder="Ex: 1000"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              A média mensal é usada para projetar a data estimada em que as próximas manutenções em KM vão vencer.
            </p>
          </div>

          {/* Licensing & Insurance Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vencimento Licenciamento (Opcional)
              </label>
              <input
                type="date"
                value={dataLicenciamento}
                onChange={(e) => setDataLicenciamento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vencimento do Seguro (Opcional)
              </label>
              <input
                type="date"
                value={dataSeguro}
                onChange={(e) => setDataSeguro(e.target.value)}
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
              <span>{carToEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
