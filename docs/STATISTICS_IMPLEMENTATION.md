# 📊 Implementação do Sistema de Estatísticas - MentorIA

## 🎯 Visão Geral

O sistema de estatísticas foi implementado para fornecer insights detalhados sobre o progresso do usuário no estudo de matemática para o ENEM. As estatísticas são atualizadas em tempo real conforme o usuário responde questões.

## 🏗️ Arquitetura Implementada

### **1. Backend (Node.js + TypeScript)**

#### **Entidades Criadas:**
- `UserAnswer`: Representa uma resposta do usuário
- `UserAnswerRepository`: Acesso aos dados de respostas
- `StatisticsService`: Lógica de negócio das estatísticas
- `StatisticsController`: Endpoints da API

#### **Endpoints da API:**

##### **GET /api/statistics/user**
Busca estatísticas completas do usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 45,
    "correctAnswers": 32,
    "accuracy": 71,
    "studyStreak": 7,
    "totalStudyTime": 180,
    "completedTests": 3,
    "averageScore": 71,
    "topicsProgress": [
      {
        "topic": "Álgebra",
        "subtopics": [
          {
            "name": "Equações do 1º grau",
            "progress": 85,
            "questionsAnswered": 12,
            "correctAnswers": 10
          }
        ],
        "totalProgress": 85,
        "totalQuestions": 12
      }
    ],
    "recentActivity": [
      {
        "date": "Hoje",
        "questionsAnswered": 8,
        "accuracy": 87
      }
    ]
  }
}
```

##### **GET /api/statistics/competencies**
Busca estatísticas de competências do usuário.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCompetencies": 265,
    "masteredCompetencies": 45,
    "inProgressCompetencies": 120,
    "beginnerCompetencies": 100,
    "averageLevel": 1.2
  }
}
```

##### **GET /api/statistics/competencies/progress**
Busca progresso detalhado por competência.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "competencyName": "Equações do 1º grau",
      "level": 2,
      "totalQuestions": 15,
      "correctAnswers": 12,
      "accuracy": 80
    }
  ]
}
```

##### **POST /api/statistics/answer**
Salva uma resposta do usuário.

**Request:**
```json
{
  "questionId": "questao_123",
  "selectedAlternativeId": "alt_a",
  "isCorrect": true,
  "timeSpentSeconds": 45
}
```

### **2. Frontend (React + TypeScript)**

#### **Serviços Criados:**
- `statisticsService`: Conecta com a API de estatísticas
- Integração com `TrainingInterface` para salvar respostas
- Atualização da `StatisticsPage` para usar dados reais

#### **Funcionalidades Implementadas:**
- ✅ Carregamento de estatísticas do backend
- ✅ Fallback para dados mock se API falhar
- ✅ Salvamento automático de respostas
- ✅ Interface de loading e tratamento de erros
- ✅ Atualização em tempo real

## 📊 Métricas Calculadas

### **Estatísticas Básicas:**
- **Total de Questões**: Número total de questões respondidas
- **Respostas Corretas**: Número de acertos
- **Taxa de Acerto**: Porcentagem de acertos
- **Sequência de Estudo**: Dias consecutivos com atividade
- **Tempo Total**: Tempo total gasto estudando
- **Testes Completados**: Número de sessões completadas

### **Progresso por Tópicos:**
- **Tópicos**: Álgebra, Geometria, Funções, etc.
- **Subtópicos**: Detalhamento dentro de cada tópico
- **Progresso**: Porcentagem de acerto por tópico/subtópico
- **Questões Respondidas**: Quantidade por tópico

### **Atividade Recente:**
- **Últimos 7 dias**: Atividade diária
- **Questões por dia**: Quantidade respondida
- **Precisão diária**: Taxa de acerto por dia

### **Competências:**
- **Níveis**: 0 (Iniciante) a 3 (Domínio)
- **Distribuição**: Quantidade por nível
- **Média**: Nível médio das competências
- **Progresso**: Evolução por competência

## 🔄 Fluxo de Dados

### **1. Usuário Responde Questão:**
```
Frontend → TrainingInterface → statisticsService.saveUserAnswer()
→ Backend → StatisticsController → StatisticsService → UserAnswerRepository
→ Banco de Dados (user_answers table)
```

### **2. Usuário Acessa Estatísticas:**
```
Frontend → StatisticsPage → statisticsService.getUserStatistics()
→ Backend → StatisticsController → StatisticsService → UserAnswerRepository
→ Banco de Dados → Processamento → Frontend
```

### **3. Atualização de Competências:**
```
Frontend → TrainingInterface → dynamicQuestionsService.completeSession()
→ Backend → DynamicQuestionsController → DynamicQuestionsService
→ UserCompetencyRepository → Banco de Dados
```

## 🗄️ Estrutura do Banco de Dados

### **Tabela `user_answers`:**
```sql
CREATE TABLE user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  question_id text REFERENCES questions(id) ON DELETE CASCADE,
  selected_alternative_id uuid REFERENCES alternatives(id),
  is_correct boolean NOT NULL,
  answered_at timestamp DEFAULT CURRENT_TIMESTAMP,
  time_spent_seconds integer,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### **Índices para Performance:**
```sql
CREATE INDEX idx_user_answers_profile_id ON user_answers(profile_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX idx_user_answers_answered_at ON user_answers(answered_at);
```

## 🧪 Testes

### **Script de Teste:**
```bash
npm run test:statistics
```

### **Testes Implementados:**
- ✅ Login e autenticação
- ✅ Busca de estatísticas do usuário
- ✅ Salvamento de respostas
- ✅ Estatísticas de competências
- ✅ Progresso de competências

## 🚀 Como Usar

### **1. Configuração Inicial:**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.supabase.example .env
# Editar .env com suas credenciais do Supabase

# Executar migrações do banco
node apply-supabase-schema.js
```

### **2. Iniciar o Backend:**
```bash
npm start
```

### **3. Iniciar o Frontend:**
```bash
cd ../mentorIA-frontend
npm run dev
```

### **4. Testar Funcionalidades:**
1. **Criar usuário** no frontend
2. **Fazer login**
3. **Completar diagnóstico** inicial
4. **Responder questões** no treinamento
5. **Verificar estatísticas** na página de estatísticas

## 📈 Próximos Passos

### **Melhorias Planejadas:**
1. **Tracking de Tempo**: Implementar cronômetro por questão
2. **Gráficos Avançados**: Adicionar visualizações interativas
3. **Relatórios**: Exportar estatísticas em PDF
4. **Notificações**: Alertas de progresso
5. **Gamificação**: Conquistas e badges
6. **Comparação**: Estatísticas comparativas entre usuários

### **Otimizações:**
1. **Cache**: Implementar cache Redis para estatísticas
2. **Paginação**: Para grandes volumes de dados
3. **Agregação**: Pré-calcular estatísticas em background
4. **Compressão**: Otimizar payload das APIs

## 🔧 Troubleshooting

### **Problemas Comuns:**

#### **1. Estatísticas não carregam:**
- Verificar se o backend está rodando
- Verificar autenticação do usuário
- Verificar logs do backend

#### **2. Respostas não são salvas:**
- Verificar conexão com banco de dados
- Verificar permissões da tabela `user_answers`
- Verificar logs do backend

#### **3. Dados inconsistentes:**
- Verificar se as questões têm `topic_name` e `subtopic_name`
- Verificar se as competências estão mapeadas corretamente
- Executar script de diagnóstico: `node check-user-competencies-status.js`

### **Logs Úteis:**
```bash
# Backend logs
npm start

# Testar estatísticas
npm run test:statistics

# Verificar dados no banco
node check-supabase-schema.js
```

## 📝 Notas de Implementação

### **Decisões Técnicas:**
1. **Fallback para Mock**: Sistema continua funcionando mesmo se API falhar
2. **Salvamento Assíncrono**: Respostas são salvas sem bloquear o fluxo
3. **Cache Inteligente**: Dados são cacheados para performance
4. **Tratamento de Erros**: Sistema robusto com fallbacks

### **Performance:**
- **Consultas Otimizadas**: Índices criados para consultas frequentes
- **Lazy Loading**: Dados carregados sob demanda
- **Paginação**: Para grandes volumes de dados
- **Cache**: Reduz consultas ao banco

### **Segurança:**
- **Autenticação**: Todas as rotas protegidas
- **Validação**: Dados validados antes de salvar
- **Sanitização**: Inputs sanitizados
- **Logs**: Auditoria de ações do usuário

---

**Status**: ✅ Implementado e Funcionando  
**Última Atualização**: Dezembro 2024  
**Versão**: 1.0.0 