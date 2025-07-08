# Guia de Validação - Backend Node.js

Este guia explica como validar que tudo está funcionando adequadamente antes de fazer um commit.

## 🚀 Validação Rápida

Para executar todas as validações de uma vez:

```bash
npm run validate
```

Ou usando o script bash:

```bash
./scripts/validate.sh
```

## 📋 Validações Disponíveis

### 1. **Formatação do Código**
```bash
# Verificar formatação
npm run prettier:check

# Corrigir formatação automaticamente
npm run prettier
```

### 2. **Linting (ESLint)**
```bash
# Verificar linting
npm run lint:check

# Corrigir problemas automaticamente
npm run lint
```

### 3. **Verificação de Tipos TypeScript**
```bash
npm run type-check
```

### 4. **Testes**
```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar apenas testes de integração
npm run test:integration
```

### 5. **Correção Automática**
Para corrigir automaticamente problemas de formatação e linting:

```bash
npm run validate:fix
```

## 🔧 Configuração de Ambiente de Teste

1. Copie o arquivo de exemplo:
```bash
cp env.test.example .env.test
```

2. Configure as variáveis de ambiente para seu banco de dados de teste:
```env
NODE_ENV=test
PORT=3001
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=backend_test
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres

# Logging
LOG_LEVEL=error
```

## 🧪 Tipos de Testes

### Testes Unitários
- Testam funções e métodos isoladamente
- Localizados em `tests/services/` e `tests/controllers/`
- Executados com: `npm run test`

### Testes de Integração
- Testam a integração entre componentes
- Testam endpoints da API
- Localizados em `tests/integration/`
- Executados com: `npm run test:integration`

### Testes BDD (Behavior Driven Development)
- Testes baseados em cenários
- Localizados em `tests/features/`
- Executados com: `npm run test`

## 📊 Cobertura de Testes

O projeto está configurado para exigir pelo menos 70% de cobertura em:
- Branches (ramificações de código)
- Functions (funções)
- Lines (linhas de código)
- Statements (declarações)

Para ver o relatório de cobertura:
```bash
npm run test:coverage
```

O relatório será gerado em `coverage/`.

## 🔄 Validação Automática (Pre-commit)

O projeto usa Husky para executar validações automaticamente antes de cada commit:

1. **Formatação do código** (Prettier)
2. **Linting** (ESLint)
3. **Verificação de tipos** (TypeScript)

Se alguma validação falhar, o commit será bloqueado até que os problemas sejam corrigidos.

## 🛠️ Solução de Problemas

### Erro de Formatação
```bash
npm run prettier
```

### Erro de Linting
```bash
npm run lint
```

### Erro de Tipos TypeScript
Verifique se todos os tipos estão corretamente definidos e importados.

### Testes Falhando
1. Verifique se o banco de dados de teste está configurado
2. Verifique se as variáveis de ambiente estão corretas
3. Execute `npm run test:watch` para ver logs detalhados

### Problemas de Dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📈 Métricas de Qualidade

### ESLint
- Configurado com regras recomendadas do TypeScript
- Verifica código não utilizado
- Enforce boas práticas

### Prettier
- Formatação consistente do código
- Configuração: aspas simples, vírgula trailing

### TypeScript
- Verificação estrita de tipos
- Sem emissão de arquivos (apenas verificação)

### Jest
- Framework de testes
- Cobertura de código
- Timeout de 10 segundos por teste

## 🎯 Checklist Pré-commit

Antes de fazer commit, certifique-se de que:

- [ ] Código está formatado (`npm run prettier:check`)
- [ ] Não há erros de linting (`npm run lint:check`)
- [ ] Tipos TypeScript estão corretos (`npm run type-check`)
- [ ] Todos os testes passam (`npm run test`)
- [ ] Cobertura de testes está adequada (`npm run test:coverage`)
- [ ] Funcionalidades principais foram testadas manualmente

## 🚨 Validação Manual

Além dos testes automatizados, sempre teste manualmente:

1. **Registro de usuário**
2. **Login de usuário**
3. **Acesso a rotas protegidas**
4. **Validação de dados**
5. **Tratamento de erros**

## 📞 Suporte

Se encontrar problemas durante a validação:

1. Verifique os logs de erro
2. Consulte este guia
3. Execute `npm run validate:fix` para correções automáticas
4. Se o problema persistir, consulte a documentação das ferramentas 