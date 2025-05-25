from docx import Document

# Criar documento
doc = Document()
doc.add_heading('MentorIA – Backend Node.js', level=1)

# Conteúdo
content = """
Backend da aplicação MentorIA, uma plataforma de apoio aos estudos para o ENEM. Este projeto foi desenvolvido como parte da disciplina de Engenharia de Software, utilizando tecnologias modernas e uma arquitetura escalável.

✨ Objetivo
Desenvolver uma API REST que permita:
- Cadastro e gerenciamento de testes e simulados
- Consulta de questões por matéria, tema e subtema
- Histórico de desempenho dos usuários
- Sistema de recomendação personalizado, baseado na performance

🚀 Tecnologias
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Jest (testes unitários)
- Pino (logging)
- env-cmd (gerenciamento de variáveis de ambiente)

📦 Instalação e Execução Local
Pré-requisitos
- Node.js (v18 ou superior)
- npm
- PostgreSQL

Passos
1. Clone o repositório:
git clone https://github.com/Luanromancin/mentorIA.git
cd mentorIA

2. Instale as dependências:
npm install

3. Configure as variáveis de ambiente. Crie um arquivo .env.dev com base no .env.example.

4. Configure o banco de dados PostgreSQL:
- Crie um banco chamado mentoria.
- Atualize a variável DATABASE_URL no .env.dev com suas credenciais, exemplo:
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mentoria?schema=public"

5. Execute as migrations para criar as tabelas:
npx prisma migrate dev

6. Rode o servidor em ambiente de desenvolvimento:
npm run start

A API estará disponível em:
http://localhost:5001/api

🧪 Testes
Execute os testes com:
npm run test

🗂 Estrutura de Pastas
src/
├── controllers/   # Lógica das rotas
├── database/      # Configurações do banco e Prisma Client
├── entities/      # Modelos de domínio (caso use além do Prisma)
├── models/        # DTOs, interfaces, tipos auxiliares
├── repositories/  # Camada de persistência (abstração sobre Prisma)
├── routes/        # Definição das rotas da API
├── services/      # Regras de negócio e orquestração
└── utils/         # Helpers, middlewares e funções utilitárias

🔗 Referências
- Node.js (https://nodejs.org/)
- Express (https://expressjs.com/)
- TypeScript (https://www.typescriptlang.org/)
- Prisma ORM (https://www.prisma.io/)
- PostgreSQL (https://www.postgresql.org/)
- Jest (https://jestjs.io/)
- Pino (https://getpino.io/)
- env-cmd (https://www.npmjs.com/package/env-cmd)

⚠️ Observações
- Este projeto utiliza Prisma ORM com PostgreSQL.
- As migrations devem ser executadas sempre que houver alteração no schema (npx prisma migrate dev).
- Arquitetura baseada em Clean Architecture + Repository Pattern, separando regras de negócio, dados e exposição (API).

📜 Licença
MIT License – veja o arquivo LICENSE para mais detalhes.
"""

# Adicionar conteúdo
doc.add_paragraph(content)

# Salvar arquivo
file_path = "/mnt/data/README_MentorIA.docx"
doc.save(file_path)
file_path
