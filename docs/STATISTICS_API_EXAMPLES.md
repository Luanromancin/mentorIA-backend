# Documentação das APIs de Estatísticas - MentorIA

Este documento contém exemplos de uso das APIs de estatísticas do projeto MentorIA.

## Configuração Inicial

### 1. Executar o Schema SQL

Primeiro, execute o script SQL no Supabase para criar a tabela e funções:

```sql
-- Execute o arquivo user-statistics-schema.sql no SQL Editor do Supabase
```

### 2. Configurar o Backend

O backend já está configurado com as rotas de estatísticas. As APIs estão disponíveis em `/api/statistics/`.

## APIs Disponíveis

### 1. Registrar Resposta do Usuário

**Endpoint:** `POST /api/statistics/record-answer`

**Descrição:** Registra uma resposta do usuário e atualiza as estatísticas automaticamente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "questionId": "123",
  "subtopicName": "Função Quadrática",
  "topicName": "Funções",
  "isCorrect": true
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Resposta registrada com sucesso"
}
```

### 2. Obter Estatísticas Completas do Usuário

**Endpoint:** `GET /api/statistics/user`

**Descrição:** Obtém todas as estatísticas do usuário em um único objeto.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "general": {
      "total_questions": 45,
      "total_correct": 32,
      "overall_accuracy": 71.11
    },
    "by_topic": [
      {
        "topic_name": "Funções",
        "questions_answered": 15,
        "correct_answers": 12,
        "accuracy_percentage": 80.0
      },
      {
        "topic_name": "Álgebra",
        "questions_answered": 20,
        "correct_answers": 14,
        "accuracy_percentage": 70.0
      }
    ],
    "by_competency": [
      {
        "subtopic_name": "Função Quadrática",
        "questions_answered": 8,
        "correct_answers": 7,
        "accuracy_percentage": 87.5
      },
      {
        "subtopic_name": "Equações do 2º grau",
        "questions_answered": 12,
        "correct_answers": 8,
        "accuracy_percentage": 66.67
      }
    ]
  }
}
```

### 3. Obter Estatísticas por Competência

**Endpoint:** `GET /api/statistics/competency/:subtopicName`

**Descrição:** Obtém estatísticas de uma competência específica.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "questions_answered": 8,
    "correct_answers": 7,
    "accuracy_percentage": 87.5
  }
}
```

### 4. Obter Estatísticas por Tópico

**Endpoint:** `GET /api/statistics/topic/:topicName`

**Descrição:** Obtém estatísticas de um tópico específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "questions_answered": 15,
    "correct_answers": 12,
    "accuracy_percentage": 80.0
  }
}
```

### 5. Obter Ranking de Competências

**Endpoint:** `GET /api/statistics/ranking`

**Descrição:** Obtém ranking das competências do usuário ordenadas por acurácia.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "subtopic_name": "Função Quadrática",
      "questions_answered": 8,
      "correct_answers": 7,
      "accuracy_percentage": 87.5
    },
    {
      "subtopic_name": "Equações do 2º grau",
      "questions_answered": 12,
      "correct_answers": 8,
      "accuracy_percentage": 66.67
    }
  ]
}
```

### 6. Obter Competências Fracas

**Endpoint:** `GET /api/statistics/weak-competencies?threshold=70`

**Descrição:** Obtém competências com acurácia abaixo do threshold especificado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "threshold": 70,
    "competencies": [
      {
        "subtopic_name": "Equações do 2º grau",
        "questions_answered": 12,
        "correct_answers": 8,
        "accuracy_percentage": 66.67
      }
    ]
  }
}
```

## Exemplos de Uso no Frontend

### 1. Registrar Resposta

```typescript
import { StatisticsService } from '@/lib/statistics';

// Quando o usuário responde uma questão
const handleAnswer = async (questionId: string, subtopicName: string, topicName: string, isCorrect: boolean) => {
  try {
    await StatisticsService.recordAnswer({
      questionId,
      subtopicName,
      topicName,
      isCorrect
    });
    console.log('Resposta registrada com sucesso');
  } catch (error) {
    console.error('Erro ao registrar resposta:', error);
  }
};
```

### 2. Carregar Estatísticas na Página de Estatísticas

```typescript
import { StatisticsService } from '@/lib/statistics';

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const userStats = await StatisticsService.getUserStatistics();
        const formattedStats = StatisticsService.formatStatistics(userStats);
        setStatistics(formattedStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Estatísticas Gerais</h2>
      <p>Total de questões: {statistics.general.totalQuestions}</p>
      <p>Acurácia geral: {statistics.general.formattedAccuracy}</p>
      
      <h3>Por Tópico</h3>
      {statistics.byTopic.map(topic => (
        <div key={topic.name}>
          <p>{topic.name}: {topic.formattedAccuracy}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Obter Competências Fracas para Recomendações

```typescript
const getWeakCompetencies = async () => {
  try {
    const weakCompetencies = await StatisticsService.getWeakCompetencies(70);
    
    // Usar para gerar recomendações de estudo
    const recommendations = weakCompetencies.competencies.map(comp => ({
      competency: comp.subtopic_name,
      priority: 'high',
      suggestedTime: Math.ceil((70 - comp.accuracy_percentage) * 2) // 2 minutos por ponto percentual
    }));
    
    return recommendations;
  } catch (error) {
    console.error('Erro ao obter competências fracas:', error);
    return [];
  }
};
```

## Estrutura da Tabela user_statistics

```sql
CREATE TABLE user_statistics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subtopic_name TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário só tem um registro por subtópico
  UNIQUE(user_id, subtopic_name)
);
```

## Funções SQL Disponíveis

### upsert_user_statistics
Registra ou atualiza estatísticas do usuário.

```sql
SELECT upsert_user_statistics(
  'user-uuid-here',
  'Função Quadrática',
  'Funções',
  true
);
```

### get_user_statistics
Obtém estatísticas completas do usuário.

```sql
SELECT get_user_statistics('user-uuid-here');
```

## Políticas de Segurança (RLS)

As seguintes políticas garantem que usuários só podem acessar suas próprias estatísticas:

- **SELECT:** Usuários podem ver apenas suas próprias estatísticas
- **INSERT:** Usuários podem inserir apenas suas próprias estatísticas
- **UPDATE:** Usuários podem atualizar apenas suas próprias estatísticas

## Considerações de Performance

1. **Índices:** A tabela possui índices otimizados para consultas por usuário e subtópico
2. **Agregações:** As consultas usam CTEs (Common Table Expressions) para melhor performance
3. **RLS:** As políticas de segurança são aplicadas no nível do banco de dados
4. **Caching:** Considere implementar cache no frontend para estatísticas que não mudam frequentemente

## Tratamento de Erros

Todas as APIs retornam erros padronizados:

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva"
}
```

Códigos de status HTTP:
- `200`: Sucesso
- `400`: Dados inválidos
- `401`: Não autenticado
- `500`: Erro interno do servidor 