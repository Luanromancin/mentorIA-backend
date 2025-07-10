# Script de validação completa para o projeto (PowerShell)
# Execute: .\scripts\validate.ps1

param(
    [switch]$Fix
)

# Configurar para parar em caso de erro
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando validação completa do projeto..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Função para imprimir status
function Write-Status {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
        exit 1
    }
}

# 1. Verificar se as dependências estão instaladas
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules não encontrado. Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Status $false "Falha ao instalar dependências"
    }
}
Write-Status $true "Dependências verificadas"

# 2. Verificar formatação do código
Write-Host "📝 Verificando formatação do código..." -ForegroundColor Yellow
if ($Fix) {
    npm run prettier
} else {
    npm run prettier:check
}
if ($LASTEXITCODE -ne 0) {
    Write-Status $false "Formatação do código falhou"
}
Write-Status $true "Formatação do código verificada"

# 3. Verificar linting
Write-Host "🔧 Verificando linting..." -ForegroundColor Yellow
if ($Fix) {
    npm run lint
} else {
    npm run lint:check
}
if ($LASTEXITCODE -ne 0) {
    Write-Status $false "Linting falhou"
}
Write-Status $true "Linting verificado"

# 4. Verificar tipos TypeScript
Write-Host "📋 Verificando tipos TypeScript..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Status $false "Verificação de tipos TypeScript falhou"
}
Write-Status $true "Tipos TypeScript verificados"

# 5. Executar testes
Write-Host "🧪 Executando testes..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Status $false "Testes falharam"
}
Write-Status $true "Testes executados"

# 6. Verificar cobertura de testes
Write-Host "📊 Verificando cobertura de testes..." -ForegroundColor Yellow
npm run test:coverage
if ($LASTEXITCODE -ne 0) {
    Write-Status $false "Cobertura de testes falhou"
}
Write-Status $true "Cobertura de testes verificada"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎉 Validação completa concluída com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo das validações:" -ForegroundColor White
Write-Host "  ✅ Dependências instaladas" -ForegroundColor Green
Write-Host "  ✅ Formatação do código" -ForegroundColor Green
Write-Host "  ✅ Linting" -ForegroundColor Green
Write-Host "  ✅ Tipos TypeScript" -ForegroundColor Green
Write-Host "  ✅ Testes unitários" -ForegroundColor Green
Write-Host "  ✅ Cobertura de testes" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 O projeto está pronto para commit!" -ForegroundColor Green 