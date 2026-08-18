import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Server, 
  GitBranch, 
  Container, 
  Cloud,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DeployGuidePanel: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.trim());
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const dockerfileCode = `# =========================================================================
# CarControle - Dockerfile para Node.js & Google Cloud Run
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm ci

# Copia código fonte e compila Vite/TypeScript
COPY . .
RUN npm run build

# Stage de Produção enxuta
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

# Copia build estático gerado pelo Vite
COPY --from=builder /app/dist ./dist

# Se usar servidor Node.js/Express:
COPY server.ts ./
# Ou se for SPA estático com servidor de arquivos:
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
`;

  const githubActionsCode = `name: Deploy CarControle to Google Cloud Run

on:
  push:
    branches: [ "main" ]

env:
  PROJECT_ID: carcontrole-123910180047
  SERVICE_NAME: carcontrole
  REGION: southamerica-east1

jobs:
  deploy:
    name: Build & Deploy to Cloud Run
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: \${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Authorize Docker Push
        run: gcloud auth configure-docker \${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build & Push Docker Image
        run: |
          IMAGE_TAG=\${{ env.REGION }}-docker.pkg.dev/\${{ env.PROJECT_ID }}/carcontrole/app:\${{ github.sha }}
          docker build -t \$IMAGE_TAG .
          docker push \$IMAGE_TAG
          echo "IMAGE_TAG=\$IMAGE_TAG" >> \$GITHUB_ENV

      - name: Deploy to Google Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: \${{ env.SERVICE_NAME }}
          region: \${{ env.REGION }}
          image: \${{ env.IMAGE_TAG }}
          flags: '--allow-unauthenticated --port=3000'
`;

  const cloudRunDeployCommand = `# 1. Autenticar no Google Cloud
gcloud auth login
gcloud config set project carcontrole-123910180047

# 2. Build e Deploy direto com Google Cloud Build e Cloud Run (southamerica-east1)
gcloud run deploy carcontrole \\
  --source . \\
  --region southamerica-east1 \\
  --allow-unauthenticated \\
  --port 3000
`;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-emerald-400" />
          <span>Guia de Deploy (Node.js + Docker + GitHub + Cloud Run)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Configuração técnica pronta para o seu serviço em <code className="text-emerald-400 font-mono">southamerica-east1.run.app</code>
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Runtime</div>
            <div className="text-sm font-bold text-white">Node.js 20+</div>
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Container className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Container</div>
            <div className="text-sm font-bold text-white">Docker Alpine</div>
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">CI/CD</div>
            <div className="text-sm font-bold text-white">GitHub Actions</div>
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Cloud Host</div>
            <div className="text-sm font-bold text-white">Cloud Run SP</div>
          </div>
        </div>

      </div>

      {/* Cloud Run Live URL Link */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-xs font-semibold text-white">Endereço do Serviço Cloud Run (southamerica-east1)</div>
            <a
              href="https://carcontrole-123910180047.southamerica-east1.run.app"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:underline font-mono"
            >
              https://carcontrole-123910180047.southamerica-east1.run.app
            </a>
          </div>
        </div>
        
        <a
          href="https://carcontrole-123910180047.southamerica-east1.run.app"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1 border border-slate-700"
        >
          <span>Abrir</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 1. Dockerfile */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Container className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">1. Arquivo Dockerfile Otimizado</h3>
          </div>
          <button
            onClick={() => copyToClipboard(dockerfileCode, 'dockerfile')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center space-x-1 border border-slate-700"
          >
            {copiedSection === 'dockerfile' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSection === 'dockerfile' ? 'Copiado!' : 'Copiar Dockerfile'}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{dockerfileCode.trim()}</pre>
        </div>
      </div>

      {/* 2. GitHub Actions Workflow */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">2. Workflow CI/CD (.github/workflows/deploy.yml)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(githubActionsCode, 'github')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center space-x-1 border border-slate-700"
          >
            {copiedSection === 'github' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSection === 'github' ? 'Copiado!' : 'Copiar YAML'}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{githubActionsCode.trim()}</pre>
        </div>
      </div>

      {/* 3. Direct gcloud Command */}
      <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">3. Deploy Direto via Linha de Comando (gcloud CLI)</h3>
          </div>
          <button
            onClick={() => copyToClipboard(cloudRunDeployCommand, 'gcloud')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center space-x-1 border border-slate-700"
          >
            {copiedSection === 'gcloud' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSection === 'gcloud' ? 'Copiado!' : 'Copiar Comando'}</span>
          </button>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{cloudRunDeployCommand.trim()}</pre>
        </div>
      </div>

    </div>
  );
};
