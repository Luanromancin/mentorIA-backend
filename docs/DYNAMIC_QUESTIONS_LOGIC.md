# Lógica de Seleção Dinâmica de Questões

## Visão Geral

O sistema de apostila dinâmica seleciona questões baseado no nível de competência do usuário, seguindo regras específicas de priorização e distribuição.

## Regras de Negócio

### 1. Níveis de Competência
- **Nível 0 (Iniciante):** 3 questões por competência
- **Nível 1 (Intermediário):** 2 questões por competência  
- **Nível 2 (Avançado):** 1 questão por competência
- **Nível 3 (Domínio):** 0 questões (usuário já domina)

### 2. Priorização
- **Ordem de prioridade:** Maior nível primeiro (2 → 1 → 0)
- **Distribuição:** Proporcional entre competências do mesmo nível
- **Limite:** Respeita `maxQuestions` (padrão: 20)

### 3. Distribuição Proporcional
Quando não há espaço para todas as questões de um nível:
- Calcula `questionsPerCompetency = Math.floor(totalQuestions / numCompetencies)`
- Distribui `remainingQuestions = totalQuestions % numCompetencies` entre as primeiras competências

## Mock Atual (UserCompetencyRepository)

### Competências Mockadas
```typescript
const mockCompetencies = [
  {
    id: 'uc-1',
    profileId: 'user-1',
    competencyId: 'comp-1',
    level: 2, // AVANÇADO
    competency: {
      id: 'comp-1',
      code: 'C1',
      name: 'Álgebra Linear',
      description: 'Operações com matrizes, sistemas lineares'
    }
  },
  {
    id: 'uc-2',
    profileId: 'user-1', 
    competencyId: 'comp-2',
    level: 1, // INTERMEDIÁRIO
    competency: {
      id: 'comp-2',
      code: 'C2',
      name: 'Cálculo Diferencial',
      description: 'Derivadas, limites, continuidade'
    }
  },
  {
    id: 'uc-3',
    profileId: 'user-1',
    competencyId: 'comp-3', 
    level: 0, // INICIANTE
    competency: {
      id: 'comp-3',
      code: 'C3',
      name: 'Geometria Analítica',
      description: 'Coordenadas, distâncias, equações'
    }
  },
  {
    id: 'uc-4',
    profileId: 'user-1',
    competencyId: 'comp-4',
    level: 0, // INICIANTE
    competency: {
      id: 'comp-4',
      code: 'C4', 
      name: 'Probabilidade',
      description: 'Eventos, distribuições, estatística'
    }
  }
];
```

### Agrupamento por Nível
```typescript
{
  0: [Geometria Analítica, Probabilidade],     // 2 competências
  1: [Cálculo Diferencial],                    // 1 competência  
  2: [Álgebra Linear],                         // 1 competência
  3: []                                        // 0 competências
}
```

## Exemplos de Cenários

### Cenário 1: maxQuestions = 5
**Cálculo:**
- Nível 2: 1 competência × 1 questão = 1 questão
- Nível 1: 1 competência × 2 questões = 2 questões  
- Nível 0: 2 competências × 3 questões = 6 questões (limite: 2)

**Resultado:** 1 + 2 + 2 = 5 questões
- Álgebra Linear: 1 questão
- Cálculo Diferencial: 2 questões
- Geometria Analítica: 1 questão
- Probabilidade: 1 questão

### Cenário 2: maxQuestions = 10
**Cálculo:**
- Nível 2: 1 competência × 1 questão = 1 questão
- Nível 1: 1 competência × 2 questões = 2 questões
- Nível 0: 2 competências × 3 questões = 6 questões

**Resultado:** 1 + 2 + 6 = 9 questões
- Álgebra Linear: 1 questão
- Cálculo Diferencial: 2 questões  
- Geometria Analítica: 3 questões
- Probabilidade: 3 questões

### Cenário 3: maxQuestions = 3
**Cálculo:**
- Nível 2: 1 competência × 1 questão = 1 questão
- Nível 1: 1 competência × 2 questões = 2 questões (limite: 2)

**Resultado:** 1 + 2 = 3 questões
- Álgebra Linear: 1 questão
- Cálculo Diferencial: 2 questões

## Questões Mockadas

Cada competência gera questões com estrutura:
```typescript
{
  id: `question-${subtopicName}-${i}`,
  title: `Questão ${i + 1} - ${subtopicName}`,
  year: 2023,
  questionIndex: i + 1,
  language: 'pt-BR',
  field: 'matemática',
  problemStatement: `Enunciado da questão ${i + 1} sobre ${subtopicName}`,
  topicName: 'Matemática',
  subtopicName: subtopicName,
  explanation: `Explicação da questão ${i + 1}`,
  alternatives: [
    { id: 'a', letter: 'A', text: 'Alternativa A', isCorrect: i === 0 },
    { id: 'b', letter: 'B', text: 'Alternativa B', isCorrect: i === 1 },
    { id: 'c', letter: 'C', text: 'Alternativa C', isCorrect: i === 2 },
    { id: 'd', letter: 'D', text: 'Alternativa D', isCorrect: i === 3 },
    { id: 'e', letter: 'E', text: 'Alternativa E', isCorrect: i === 4 }
  ],
  competencyLevel: level // Nível da competência
}
```

## Fluxo de Processamento

1. **Buscar competências** do usuário agrupadas por nível
2. **Calcular questões por nível** baseado na regra de negócio
3. **Distribuir proporcionalmente** entre competências do mesmo nível
4. **Buscar questões mockadas** para cada competência
5. **Adicionar nível** a cada questão retornada
6. **Retornar array** ordenado por prioridade de nível 