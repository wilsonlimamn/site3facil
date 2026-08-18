import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  ShieldCheck, 
  Key, 
  HardDrive,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { SQLITE_SCHEMA_DDL } from '../../services/sqliteStorage';

export const DriveSyncPanel: React.FC = () => {
  const { 
    user, 
    driveSync, 
    loginGoogle, 
    logoutGoogle, 
    syncWithGoogleDrive, 
    restoreFromGoogleDrive,
    exportSqlite,
    exportJson,
    importJson,
    resetDemoData,
    cars,
    rules,
    maintenanceRecords,
    fuelRecords,
    expenseRecords
  } = useCarContext();

  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncingLocal(true);
    setSyncSuccessMsg(null);
    try {
      await syncWithGoogleDrive();
      setSyncSuccessMsg('Banco de dados sincronizado e salvo no seu Google Drive com sucesso!');
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao sincronizar com Google Drive');
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const handleRestoreNow = async () => {
    const confirmed = confirm(
      'Tem certeza que deseja restaurar o banco a partir do Google Drive? Os dados atuais da sua sessão local serão atualizados com a versão na nuvem.'
    );
    if (!confirmed) return;

    setIsSyncingLocal(true);
    setSyncSuccessMsg(null);
    try {
      await restoreFromGoogleDrive();
      setSyncSuccessMsg('Dados restaurados com sucesso do seu Google Drive!');
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar do Google Drive');
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importJson(json);
        if (ok) {
          alert('Backup importado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SQLITE_SCHEMA_DDL.trim());
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-400" />
          <span>Banco de Dados Local & Sincronização Google Drive</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Arquitetura privada: banco disponível localmente no seu dispositivo e sincronizado no seu próprio Google Drive
        </p>
      </div>

      {/* Architecture Cards (Local SQLite + Google Drive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Google Drive Cloud Card */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Cloud className="h-6 w-6" />
              </div>

              {user && driveSync.isConnected ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Google Drive Conectado</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  <span>Não conectado</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Google Drive Pessoal</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                O arquivo de banco <code className="text-blue-300 font-mono bg-slate-950 px-1 py-0.5 rounded">carcontrole_database.json</code> é salvo na sua conta Google pessoal, garantindo total privacidade e controle sobre seus dados.
              </p>
            </div>

            {/* User info if connected */}
            {user ? (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Conta Google:</span>
                  <span className="font-medium text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Último Backup:</span>
                  <span className="font-mono text-slate-300">
                    {driveSync.lastSyncedAt
                      ? new Date(driveSync.lastSyncedAt).toLocaleString('pt-BR')
                      : 'Ainda não sincronizado nesta sessão'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>Faça login com a sua conta Google para sincronizar e proteger seus dados de manutenção e veículos na nuvem.</p>
              </div>
            )}

            {syncSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{syncSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncingLocal}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLocal ? 'animate-spin' : ''}`} />
                  <span>{isSyncingLocal ? 'Sincronizando...' : 'Salvar no Google Drive Agora'}</span>
                </button>

                <button
                  onClick={handleRestoreNow}
                  disabled={isSyncingLocal}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Restaurar do Drive
                </button>

                <button
                  onClick={logoutGoogle}
                  className="text-xs text-rose-400 hover:text-rose-300 transition ml-auto"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={loginGoogle}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Conectar com Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Local Storage & SQLite Engine Card */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <HardDrive className="h-6 w-6" />
              </div>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Offline-First Ativo</span>
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Armazenamento Local</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Os dados são salvos instantaneamente no armazenamento do seu navegador para acesso rápido mesmo sem internet, e você pode baixar o dump SQL ou JSON a qualquer momento.
              </p>
            </div>

            {/* Summary statistics of local records */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Veículos</span>
                <span className="font-bold text-white font-mono">{cars.length}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Manutenções</span>
                <span className="font-bold text-white font-mono">{maintenanceRecords.length}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Abastecimentos</span>
                <span className="font-bold text-white font-mono">{fuelRecords.length}</span>
              </div>
            </div>
          </div>

          {/* Export / Import Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              onClick={exportSqlite}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5 border border-slate-700"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>Baixar Dump SQL (.sql)</span>
            </button>

            <button
              onClick={exportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5 border border-slate-700"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              <span>Baixar Backup (.json)</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5 border border-slate-700 cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-emerald-400" />
              <span>Restaurar de Arquivo</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

      </div>

      {/* SQL Schema Inspector */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Estrutura do Banco SQLite (DDL)</h3>
          </div>

          <button
            onClick={handleCopySchema}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center space-x-1 border border-slate-700"
          >
            {copiedSchema ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSchema ? 'Copiado!' : 'Copiar DDL'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-60 overflow-y-auto leading-relaxed scrollbar-thin">
          <pre>{SQLITE_SCHEMA_DDL.trim()}</pre>
        </div>
      </div>

    </div>
  );
};
