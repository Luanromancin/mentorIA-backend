const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({
    msg: 'Servidor simples funcionando',
    msgCode: 'success',
    code: 200,
    data: { message: 'OK' }
  });
});

// Rota de sessão simplificada
app.get('/api/questions/session', (req, res) => {
  console.log('📥 Requisição recebida para /api/questions/session');
  
  // Simular dados de competências
  const mockCompetencies = {
    0: [
      {
        id: 'test-1',
        profileId: '9da00b0d-d2f7-4589-9321-8179553f2b47',
        competencyId: 'comp-1',
        level: 0,
        competency: {
          id: 'comp-1',
          code: 'C1',
          name: 'Matemática Básica',
          description: 'Conceitos fundamentais'
        }
      }
    ],
    1: [],
    2: [],
    3: []
  };

  // Simular questões
  const mockQuestions = [
    {
      id: 'q1',
      title: 'Questão Teste 1',
      year: 2024,
      questionIndex: 1,
      language: 'pt-br',
      field: 'matematica',
      problemStatement: 'Qual é o resultado de 2 + 2?',
      alternatives: [
        { id: 'a1', letter: 'A', text: '3', isCorrect: false },
        { id: 'a2', letter: 'B', text: '4', isCorrect: true },
        { id: 'a3', letter: 'C', text: '5', isCorrect: false }
      ],
      competencyLevel: 0
    }
  ];

  res.json({
    msg: 'Sessão de questões carregada com sucesso',
    msgCode: 'success',
    code: 200,
    data: {
      userCompetencies: mockCompetencies,
      questions: mockQuestions,
      sessionId: `session_${Date.now()}`
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor simples rodando na porta ${PORT}`);
  console.log(`📡 Teste: http://localhost:${PORT}/api/test`);
  console.log(`📚 Sessão: http://localhost:${PORT}/api/questions/session`);
}); 