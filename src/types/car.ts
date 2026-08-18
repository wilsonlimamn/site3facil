export type MaintenanceStatus = 'vencido' | 'atencao' | 'em_dia';

export type MaintenanceCategory = 'motor' | 'freios' | 'suspensao_pneus' | 'transmissao' | 'eletrica' | 'fluidos' | 'documentacao' | 'geral';

export type MaintenanceType = 'preventiva' | 'corretiva' | 'revisao_geral';

export type FuelType = 'Flex (Gasolina/Etanol)' | 'Gasolina' | 'Etanol' | 'Diesel' | 'GNV' | 'Eletrico' | 'Hibrido';

export type ExpenseCategory = 'combustivel' | 'manutencao' | 'ipva_licenciamento' | 'seguro' | 'pedagio' | 'estacionamento' | 'lavagem' | 'multa' | 'acessorios' | 'outros';

export interface Car {
  id: string;
  apelido: string; // Ex: "Meu Civic", "Onix do Trabalho"
  marca: string;
  modelo: string;
  ano: number;
  cor: string;
  placa: string;
  combustivel: FuelType;
  kmAtual: number;
  kmMediaMensal: number; // Média de KM rodados por mês para projeção de datas
  dataUltimaAtualizacaoKm: string;
  capacidadeTanqueLitros?: number;
  dataLicenciamento?: string; // Vencimento anual
  dataVencimentoSeguro?: string;
  fotoUrl?: string;
  criadoEm: string;
}

export interface MaintenanceRule {
  id: string;
  carId: string;
  titulo: string; // Ex: "Troca de Óleo e Filtro"
  categoria: MaintenanceCategory;
  descricao?: string;
  intervaloKm?: number; // Ex: 10000 km
  intervaloMeses?: number; // Ex: 6 meses ou 12 meses
  
  // Última realização
  ultimoKmRealizado?: number;
  ultimaDataRealizada?: string;
  
  // Valores calculados / customizados
  proximoKmLimite?: number;
  proximaDataLimite?: string;
  
  // Alerta prévio
  alertaKmAntecedencia?: number; // Avisar X km antes (default: 500 km)
  alertaDiasAntecedencia?: number; // Avisar X dias antes (default: 15 dias)
  
  obrigatorio?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  carId: string;
  ruleId?: string; // Vinculado a uma regra
  titulo: string;
  tipo: 'preventiva' | 'corretiva' | 'revisao_geral';
  dataRealizada: string;
  kmRealizado: number;
  oficina?: string;
  custoPecas: number;
  custoMaoDeObra: number;
  custoTotal: number;
  proximoKmRecomendado?: number;
  proximaDataRecomendada?: string;
  comprovanteNota?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface FuelRecord {
  id: string;
  carId: string;
  data: string;
  kmMomento: number;
  tipoCombustivel: string;
  litros: number;
  precoPorLitro: number;
  valorTotal: number;
  tanqueCheio: boolean;
  posto?: string;
  kmPorLitroCalculado?: number;
  custoPorKm?: number;
  observacoes?: string;
  criadoEm: string;
}

export interface ExpenseRecord {
  id: string;
  carId: string;
  categoria: ExpenseCategory;
  descricao: string;
  data: string;
  valor: number;
  kmMomento?: number;
  observacoes?: string;
  criadoEm: string;
}

export interface KmLog {
  id: string;
  carId: string;
  km: number;
  data: string;
  origem: 'manual' | 'abastecimento' | 'manutencao' | 'viagem';
  observacao?: string;
}

export interface MaintenanceAlert {
  id: string;
  carId: string;
  carApelido: string;
  ruleId: string;
  titulo: string;
  status: MaintenanceStatus;
  motivo: 'km_vencido' | 'data_vencida' | 'km_proximo' | 'data_proxima' | 'ambos_vencidos';
  kmAtual: number;
  kmLimite?: number;
  kmRestante?: number;
  dataLimite?: string;
  diasRestantes?: number;
  dataEstimadaVencimento?: string;
  descricao: string;
}

export interface GoogleUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface DriveSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  fileId: string | null;
  fileName: string;
  error: string | null;
  autoSync: boolean;
}
