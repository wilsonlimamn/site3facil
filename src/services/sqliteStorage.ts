import { Car, MaintenanceRule, MaintenanceRecord, FuelRecord, ExpenseRecord, KmLog } from '../types/car';

export interface DatabaseState {
  version: number;
  lastUpdated: string;
  cars: Car[];
  rules: MaintenanceRule[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  expenseRecords: ExpenseRecord[];
  kmLogs: KmLog[];
}

const LOCAL_STORAGE_KEY = 'carcontrole_personal_db_v1';

export const SQLITE_SCHEMA_DDL = `
-- =========================================================================
-- CarControle SQLite Database Schema (Local & Google Drive Personal Sync)
-- =========================================================================

CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    apelido TEXT NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    cor TEXT,
    placa TEXT NOT NULL,
    combustivel TEXT NOT NULL,
    km_atual INTEGER NOT NULL DEFAULT 0,
    km_media_mensal INTEGER NOT NULL DEFAULT 1000,
    data_ultima_atualizacao_km TEXT NOT NULL,
    capacidade_tanque_litros REAL,
    data_licenciamento TEXT,
    data_vencimento_seguro TEXT,
    foto_url TEXT,
    criado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS maintenance_rules (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT,
    intervalo_km INTEGER,
    intervalo_meses INTEGER,
    ultimo_km_realizado INTEGER,
    ultima_data_realizada TEXT,
    proximo_km_limite INTEGER,
    proxima_data_limite TEXT,
    alerta_km_antecedencia INTEGER DEFAULT 500,
    alerta_dias_antecedencia INTEGER DEFAULT 15,
    obrigatorio INTEGER DEFAULT 0,
    FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL,
    rule_id TEXT,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    data_realizada TEXT NOT NULL,
    km_realizado INTEGER NOT NULL,
    oficina TEXT,
    custo_pecas REAL NOT NULL DEFAULT 0.0,
    custo_mao_de_obra REAL NOT NULL DEFAULT 0.0,
    custo_total REAL NOT NULL DEFAULT 0.0,
    proximo_km_recomendado INTEGER,
    proxima_data_recomendada TEXT,
    comprovante_nota TEXT,
    observacoes TEXT,
    criado_em TEXT NOT NULL,
    FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fuel_records (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL,
    data TEXT NOT NULL,
    km_momento INTEGER NOT NULL,
    tipo_combustivel TEXT NOT NULL,
    litros REAL NOT NULL,
    preco_por_litro REAL NOT NULL,
    valor_total REAL NOT NULL,
    tanque_cheio INTEGER NOT NULL DEFAULT 1,
    posto TEXT,
    km_por_litro_calculado REAL,
    custo_por_km REAL,
    observacoes TEXT,
    criado_em TEXT NOT NULL,
    FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expense_records (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    valor REAL NOT NULL,
    km_momento INTEGER,
    observacoes TEXT,
    criado_em TEXT NOT NULL,
    FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS km_logs (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL,
    km INTEGER NOT NULL,
    data TEXT NOT NULL,
    origem TEXT NOT NULL,
    observacao TEXT,
    FOREIGN KEY(car_id) REFERENCES cars(id) ON DELETE CASCADE
);
`;

/**
 * Loads the database from local storage
 */
export function loadLocalDatabase(): DatabaseState | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DatabaseState;
  } catch (err) {
    console.error('Falha ao carregar banco de dados local:', err);
    return null;
  }
}

/**
 * Saves the database to local storage
 */
export function saveLocalDatabase(db: DatabaseState): void {
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Falha ao persistir banco de dados local:', err);
  }
}

/**
 * Generates an executable SQL Dump string with all current data
 */
export function generateSqlDump(db: DatabaseState): string {
  let sql = `-- CarControle SQL Dump\n-- Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
  sql += SQLITE_SCHEMA_DDL + '\n\n';

  // Cars
  if (db.cars.length > 0) {
    sql += `-- Veículos Cadastrados\n`;
    for (const car of db.cars) {
      sql += `INSERT OR REPLACE INTO cars VALUES ('${car.id}', '${escapeSql(car.apelido)}', '${escapeSql(car.marca)}', '${escapeSql(car.modelo)}', ${car.ano}, '${escapeSql(car.cor)}', '${car.placa}', '${car.combustivel}', ${car.kmAtual}, ${car.kmMediaMensal}, '${car.dataUltimaAtualizacaoKm}', ${car.capacidadeTanqueLitros || 'NULL'}, ${car.dataLicenciamento ? `'${car.dataLicenciamento}'` : 'NULL'}, ${car.dataVencimentoSeguro ? `'${car.dataVencimentoSeguro}'` : 'NULL'}, ${car.fotoUrl ? `'${car.fotoUrl}'` : 'NULL'}, '${car.criadoEm}');\n`;
    }
    sql += '\n';
  }

  // Rules
  if (db.rules.length > 0) {
    sql += `-- Regras e Cronogramas de Manutenção\n`;
    for (const r of db.rules) {
      sql += `INSERT OR REPLACE INTO maintenance_rules VALUES ('${r.id}', '${r.carId}', '${escapeSql(r.titulo)}', '${r.categoria}', '${escapeSql(r.descricao || '')}', ${r.intervaloKm || 'NULL'}, ${r.intervaloMeses || 'NULL'}, ${r.ultimoKmRealizado ?? 'NULL'}, ${r.ultimaDataRealizada ? `'${r.ultimaDataRealizada}'` : 'NULL'}, ${r.proximoKmLimite ?? 'NULL'}, ${r.proximaDataLimite ? `'${r.proximaDataLimite}'` : 'NULL'}, ${r.alertaKmAntecedencia || 500}, ${r.alertaDiasAntecedencia || 15}, ${r.obrigatorio ? 1 : 0});\n`;
    }
    sql += '\n';
  }

  // Maintenance Records
  if (db.maintenanceRecords.length > 0) {
    sql += `-- Histórico de Manutenções Realizadas\n`;
    for (const m of db.maintenanceRecords) {
      sql += `INSERT OR REPLACE INTO maintenance_records VALUES ('${m.id}', '${m.carId}', ${m.ruleId ? `'${m.ruleId}'` : 'NULL'}, '${escapeSql(m.titulo)}', '${m.tipo}', '${m.dataRealizada}', ${m.kmRealizado}, '${escapeSql(m.oficina || '')}', ${m.custoPecas}, ${m.custoMaoDeObra}, ${m.custoTotal}, ${m.proximoKmRecomendado ?? 'NULL'}, ${m.proximaDataRecomendada ? `'${m.proximaDataRecomendada}'` : 'NULL'}, '${escapeSql(m.comprovanteNota || '')}', '${escapeSql(m.observacoes || '')}', '${m.criadoEm}');\n`;
    }
    sql += '\n';
  }

  // Fuel Records
  if (db.fuelRecords.length > 0) {
    sql += `-- Histórico de Abastecimentos\n`;
    for (const f of db.fuelRecords) {
      sql += `INSERT OR REPLACE INTO fuel_records VALUES ('${f.id}', '${f.carId}', '${f.data}', ${f.kmMomento}, '${escapeSql(f.tipoCombustivel)}', ${f.litros}, ${f.precoPorLitro}, ${f.valorTotal}, ${f.tanqueCheio ? 1 : 0}, '${escapeSql(f.posto || '')}', ${f.kmPorLitroCalculado ?? 'NULL'}, ${f.custoPorKm ?? 'NULL'}, '${escapeSql(f.observacoes || '')}', '${f.criadoEm}');\n`;
    }
    sql += '\n';
  }

  return sql;
}

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

/**
 * Downloads a file to the user's browser
 */
export function exportFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
