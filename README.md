#    MentorIA – Backend

## Projeto desenvolvido para Disciplina de Engenharia de Software da Universidade Federal de Pernambuco.

Backend da plataforma MentorIA, um tutor digital inteligente que identifica dificuldades dos estudantes, gera trilhas de treinamento personalizadas e guia até o domínio completo das competências para ENEM, com potencial de expansão para ITA, IME, concursos e outros aprendizados.

### ✅ Este repositório corresponde *ao backend.* O frontend está disponível [aqui](https://github.com/gabrielalimasotero/MentorIA-Frontend).
### ✅ Build [aqui](https://github.com/Luanromancin/mentorIA-backend/blob/main/BUILD.md)
### ✅ Contributing [aqui](https://github.com/Luanromancin/mentorIA-backend/blob/main/CONTRIBUTING.md)

## 🎯 Objetivos e Funcionalidades

### Objetivos Principais
- Transformar a forma como estudantes identificam seus pontos fortes e fracos
- Utilizar tecnologia, IA e gamificação para acelerar o progresso do aprendizado
- Criar uma experiência personalizada e adaptativa para cada estudante
- Implementar sistema de competências baseado em domínio real

### Funcionalidades Principais
- 🔐 *Sistema de Autenticação Unificado* - Supabase Auth + JWT
- 🧠 *Teste de Nivelamento Inteligente* - 26 questões para mapear competências
- 🎯 *Questões Dinâmicas* - Baseadas no nível de competência do usuário
-    *Dashboard de Estatísticas Avançado* - Progresso por tópico e competência
- 🔄 *Sistema de Competências Adaptativo* - Níveis 0-3 com evolução automática
- 📱 *API RESTful Completa* - Endpoints para todas as funcionalidades
- 🏆 *Gamificação* - Sequência de estudo, conquistas e progresso
- 🚀 *Revisão Inteligente* - Spaced repetition para retenção eficiente

## 🏗️ Arquitetura e Estrutura

### Estrutura do Código
plaintext
src/
├── controllers/     # Controladores da API REST
├── services/        # Lógica de negócio e integrações
├── repositories/    # Camada de acesso a dados
├── entities/        # Entidades do domínio
├── models/          # Modelos de dados
├── routes/          # Definição de rotas
├── middlewares/     # Middlewares de autenticação e validação
├── database/        # Configurações do banco de dados
├── config/          # Configurações do Supabase
├── utils/           # Utilitários e helpers
├── di/              # Injeção de dependências
└── tests/           # Testes unitários e de integração


### Padrões Arquiteturais
- *Clean Architecture* - Separação clara de responsabilidades
- *Dependency Injection* - Inversão de controle
- *Repository Pattern* - Abstração do acesso a dados
- *Service Layer* - Lógica de negócio centralizada
- *Middleware Pattern* - Autenticação e validação

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
|--------|-------------|
| *Runtime* | Node.js (v18+) |
| *Framework* | Express.js |
| *Linguagem* | TypeScript |
| *Banco de Dados* | PostgreSQL (Supabase) |
| *Autenticação* | Supabase Auth + JWT |
| *ORM* | Sequelize |
| *Testes* | Vitest + Supertest |
| *Validação* | class-validator + class-transformer |
| *Logging* | Pino |
| *Deploy* | Railway/Neon |

##    Guia de Instalação e Execução

### Pré-requisitos
- Node.js (v18+)
- npm
- Conta no Supabase
- PostgreSQL (fornecido pelo Supabase)

### Instalação

1. *Clone o repositório:*
bash
git clone https://github.com/Luanromancin/mentorIA-backend.git
cd mentorIA-backend


2. *Instale as dependências:*
bash
npm install


3. *Configure o ambiente:*
bash
cp env.supabase.example .env
# Edite o arquivo .env com suas configurações do Supabase


4. *Configure o Supabase:*
- Crie um projeto no Supabase
- Execute o script docs/supabase-schema.sql no SQL Editor
- Configure as variáveis de ambiente

5. *Execute as migrações:*
bash
npm run migrate


6. *Inicie o servidor:*
bash
npm start


A API estará disponível em: http://localhost:3000/api

### Scripts Disponíveis
bash
npm run start:dev      # Desenvolvimento com hot reload
npm run build          # Build para produção
npm run prod           # Executar em produção
npm run test           # Executar todos os testes
npm run test:leveling  # Teste específico de nivelamento
npm run test:coverage  # Testes com cobertura
npm run lint           # Linting e formatação
npm run validate       # Validação completa (lint + test + type-check)


## 📚 Documentação da API

### Endpoints Principais

#### Autenticação
- POST /api/auth/register - Registro de usuário
- POST /api/auth/login - Login
- GET /api/auth/validate-token - Validação de token

#### Teste de Nivelamento
- POST /api/leveling-test/start - Iniciar teste
- POST /api/leveling-test/answer - Responder questão
- POST /api/leveling-test/complete - Finalizar teste
- GET /api/leveling-test/status - Status do teste

#### Questões Dinâmicas
- GET /api/questions/session - Carregar sessão de questões
- POST /api/questions/session/complete - Finalizar sessão
- GET /api/questions/dynamic - Questões dinâmicas (legado)

#### Estatísticas
- GET /api/statistics/user - Estatísticas do usuário
- POST /api/statistics/record-answer - Registrar resposta
- GET /api/statistics/topics - Tópicos disponíveis

### Exemplo de Uso
bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Iniciar teste de nivelamento
curl -X POST http://localhost:3000/api/leveling-test/start \
  -H "Authorization: Bearer YOUR_TOKEN"


## 🧪 Testes

### Executar Testes
bash
npm run test              # Todos os testes
npm run test:leveling     # Teste de nivelamento
npm run test:coverage     # Com cobertura
npm run test:integration  # Testes de integração


### Estrutura de Testes
- *Unitários*: Serviços e utilitários
- *Integração*: Controllers e rotas
- *E2E*: Fluxos completos (teste de nivelamento)

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente
env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret


### Configuração do Supabase
1. Crie um projeto no Supabase
2. Execute o schema SQL em docs/supabase-schema.sql
3. Configure as políticas RLS
4. Configure as variáveis de ambiente

## 📊 Monitoramento e Logs

### Logs
- *Pino* para logging estruturado
- Logs de performance e erros
- Rastreamento de requisições

### Métricas
- Tempo de resposta das APIs
- Taxa de erro
- Uso de recursos

##    Como Contribuir

1. *Fork* o repositório
2. *Crie uma branch*: git checkout -b feature/nova-funcionalidade
3. *Faça commit*: git commit -m 'feat: adiciona nova funcionalidade'
4. *Envie a branch*: git push origin feature/nova-funcionalidade
5. *Crie um Pull Request*

### Padrões de Commit
- feat: Nova funcionalidade
- fix: Correção de bug
- docs: Documentação
- test: Testes
- refactor: Refatoração

### Issues
- [Lista de Issues](https://github.com/Luanromancin/mentorIA-backend/issues)
- [Good First Issues](https://github.com/Luanromancin/mentorIA-backend/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

## 📚 Recursos Importantes

- [Documentação da API](docs/api-documentation.md)
- [Guia de Integração](docs/INTEGRATION_GUIDE.md)
- [Arquitetura do Sistema](docs/architecture-pattern.md)
- [Otimizações de Performance](docs/PERFORMANCE_OPTIMIZATION.md)
- [Teste de Nivelamento](docs/DYNAMIC_QUESTIONS_LOGIC.md)

## 🔗 Links Úteis

- [MockUp Lovable](https://enem-inteligente-trilhas.lovable.app)
- [Documentação de Prompts](https://docs.google.com/document/d/1UBrHngoffLZ_rZ41sQmcjgG_E-nV7RGi3b3HwKDuhQk/edit?usp=sharing)
- [Supabase Dashboard](https://supabase.com/dashboard)

## 👥 Equipe

- *Antonio Gabriel* - [GitHub](https://github.com/gabrielclemnt)
- *Gabriela Lima Sotero* - [GitHub](https://github.com/gabrielalimasotero)
- *Luan Romancini* - [GitHub](https://github.com/Luanromancin)
- *Wilton Sales* - [GitHub](https://github.com/WilSales)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

*MentorIA* - Transformando a educação através da tecnologia e inteligência artificial.
