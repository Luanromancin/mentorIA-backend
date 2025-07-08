#!/bin/bash

# Script de validação completa para o projeto
# Execute: ./scripts/validate.sh

set -e  # Para o script se qualquer comando falhar

echo "🚀 Iniciando validação completa do projeto..."
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# 1. Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Instalando dependências...${NC}"
    npm install
fi
print_status $? "Dependências verificadas"

# 2. Verificar formatação do código
echo "📝 Verificando formatação do código..."
npm run prettier:check
print_status $? "Formatação do código verificada"

# 3. Verificar linting
echo "🔧 Verificando linting..."
npm run lint:check
print_status $? "Linting verificado"

# 4. Verificar tipos TypeScript
echo "📋 Verificando tipos TypeScript..."
npm run type-check
print_status $? "Tipos TypeScript verificados"

# 5. Executar testes
echo "🧪 Executando testes..."
npm run test
print_status $? "Testes executados"

# 6. Verificar cobertura de testes
echo "📊 Verificando cobertura de testes..."
npm run test:coverage
print_status $? "Cobertura de testes verificada"

echo "================================================"
echo -e "${GREEN}🎉 Validação completa concluída com sucesso!${NC}"
echo ""
echo "📋 Resumo das validações:"
echo "  ✅ Dependências instaladas"
echo "  ✅ Formatação do código"
echo "  ✅ Linting"
echo "  ✅ Tipos TypeScript"
echo "  ✅ Testes unitários"
echo "  ✅ Cobertura de testes"
echo ""
echo "🚀 O projeto está pronto para commit!" 