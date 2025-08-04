# Apostila Dinâmica - Implementação

## 📋 **Visão Geral**

A apostila dinâmica é um sistema que seleciona questões automaticamente baseado no nível de domínio do usuário em cada competência matemática. O sistema implementa uma lógica adaptativa que prioriza competências com maior necessidade de prática.

## 🎯 **Regras de Seleção**

### **Níveis de Competência:**
- **Nível 0 (Iniciante)**: 3 questões por competência
- **Nível 1 (Intermediário)**: 2 questões por competência  
- **Nível 2 (Avançado)**: 1 questão por competência
- **Nível 3 (Domínio)**: 0 questões por competência

### **Prioridade:**
1. **Maior nível primeiro**: Competências nível 2 → nível 1 → nível 0
2. **Máximo de questões**: 20 por sessão (configurável)
3. **Sem repetição**: Questões já respondidas são excluídas

## 🏗️ **Arquitetura Implementada**

### **1. Entidades Criadas:**
- `Competency`: Representa uma competência matemática
- `UserCompetency`: Progresso do usuário por competência

### **2. Serviços:**
- `DynamicQuestionsService`: Lógica de seleção de questões
- `UserCompetencyRepository`: Acesso aos dados de competência

### **3. Controllers:**
- `DynamicQuestionsController`: Endpoints da API

## 🔌 **Endpoints da API**

### **GET /api/questions/dynamic**
Busca questões dinâmicas baseadas no nível do usuário.

**Query Parameters:**
- `maxQuestions` (opcional): Número máximo de questões (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "questao_123",
        "title": "Título da questão",
        "problemStatement": "Enunciado...",
        "alternatives": [...],
        "competencyLevel": 2
      }
    ],
    "total": 15,
    "maxQuestions": 20
  }
}
```

### **POST /api/questions/answer**
Submete resposta e atualiza nível de competência.

**Body:**
```json
{
  "questionId": "questao_123",
  "selectedAlternativeId": "alt_456",
  "isCorrect": true,
  "competencyName": "Álgebra Linear",
  "timeSpentSeconds": 45
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Resposta processada com sucesso",
    "isCorrect": true,
    "competencyName": "Álgebra Linear"
  }
}
```

### **GET /api/competencies/user**
Busca competências do usuário com níveis.

**Response:**
```json
{
  "success": true,
  "data": {
    "competencies": [
      {
        "profileId": "user_123",
        "competencyId": "comp_456",
        "level": 2,
        "competency": {
          "id": "comp_456",
          "code": "C1",
          "name": "Álgebra Linear",
          "description": "..."
        }
      }
    ],
    "total": 10
  }
}
```

## 🗄️ **Estrutura do Banco**

### **Tabela `competencies`:**
```sql
CREATE TABLE competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- C1, C2, etc.
  name text NOT NULL, -- Nome da competência
  description text,
  subject_id uuid,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela `user_competencies`:**
```sql
CREATE TABLE user_competencies (
  profile_id uuid REFERENCES profiles(id),
  competency_id uuid REFERENCES competencies(id),
  level integer DEFAULT 0, -- 0, 1, 2, 3
  last_evaluated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id, competency_id)
);
```

## 🚀 **Como Usar**

### **1. Configuração Inicial:**
```bash
# Executar script SQL para criar tabela competencies
psql -d your_database -f docs/COMPETENCIES_TABLE.sql

# Inicializar competências dos usuários existentes
node scripts/initialize-user-competencies.js
```

### **2. Fluxo de Uso:**
1. **Frontend** chama `GET /api/questions/dynamic`
2. **Backend** analisa níveis de competência do usuário
3. **Backend** seleciona questões baseado na regra
4. **Frontend** apresenta questões ao usuário
5. **Usuário** responde questões
6. **Frontend** chama `POST /api/questions/answer` para cada resposta
7. **Backend** atualiza nível de competência automaticamente

## 📊 **Lógica de Atualização de Nível**

### **Regras:**
- **Acerto**: Nível aumenta em 1 (máximo 3)
- **Erro**: Nível diminui em 1 (mínimo 0)

### **Exemplo:**
```
Usuário nível 1 acerta → nível 2
Usuário nível 2 erra → nível 1
Usuário nível 0 erra → nível 0 (não diminui)
Usuário nível 3 acerta → nível 3 (não aumenta)
```

## 🔧 **Configurações**

### **Variáveis de Ambiente:**
- `DATABASE_URL`: Conexão com o banco de dados
- `SUPABASE_URL`: URL do Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

### **Parâmetros Configuráveis:**
- **Questões por sessão**: Default 20 (via query param)
- **Questões por competência**: Hardcoded na regra (0=3, 1=2, 2=1, 3=0)

## 🧪 **Testes**

### **Executar Testes:**
```bash
npm test
npm run test:coverage
```

### **Testar Endpoints:**
```bash
# Buscar questões dinâmicas
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/questions/dynamic?maxQuestions=10"

# Submeter resposta
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questionId":"123","selectedAlternativeId":"456","isCorrect":true,"competencyName":"Álgebra Linear"}' \
  "http://localhost:3000/api/questions/answer"
```

## 🔄 **Próximos Passos**

1. **Frontend**: Integrar com os novos endpoints
2. **Testes**: Adicionar testes para os novos serviços
3. **Monitoramento**: Adicionar logs e métricas
4. **Otimização**: Cache de competências do usuário
5. **Expansão**: Suporte a múltiplas matérias

## 📝 **Notas de Implementação**

- **Performance**: Queries otimizadas com índices
- **Segurança**: Autenticação obrigatória em todos os endpoints
- **Escalabilidade**: Estrutura preparada para múltiplas matérias
- **Manutenibilidade**: Código modular e bem documentado 