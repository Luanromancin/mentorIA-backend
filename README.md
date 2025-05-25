# MentorIA – Backend Node.js

Este projeto é o backend da aplicação **MentorIA**, uma ferramenta de apoio aos estudos para o ENEM. Desenvolvido como parte da disciplina de Engenharia de Software, utiliza tecnologias modernas para fornecer uma base sólida para funcionalidades futuras.

## ✨ Objetivo

Criar uma API que forneça recursos como:
- Cadastro e gerenciamento de testes/simulados
- Consulta de questões por matéria/tema
- Histórico de desempenho
- Recomendação personalizada com base em performance

## 🚀 Tecnologias utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/) para testes
- [Pino](https://getpino.io/) para logging
- [env-cmd](https://www.npmjs.com/package/env-cmd) para gerenciamento de ambiente

## 📦 Como executar o projeto localmente

### Pré-requisitos

- Node.js (v18+)
- npm

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/Luanromancin/mentorIA.git
cd mentorIA
Instale as dependências:

bash
Copiar
Editar
npm install
Crie um arquivo .env.dev com base no .env.example.

Inicie o servidor:

bash
Copiar
Editar
npm run start
A API estará disponível em: http://localhost:5001/api

🧪 Testes
Execute os testes com:

bash
Copiar
Editar
npm run test
🗂 Estrutura de pastas
css
Copiar
Editar
src/
├── controllers/
├── database/
├── entities/
├── models/
├── repositories/
├── routes/
├── services/
└── utils/
👨‍💻 Autoria
Desenvolvido por Luan Romancini
Disciplina de Engenharia de Software – CIn/UFPE

yaml
Copiar
Editar

---

### ✅ O que fazer agora:

1. Copie esse conteúdo para o arquivo `README.md` do seu projeto
2. Salve e execute:

```bash
git add README.md
git commit -m "Adiciona README inicial com descrição do projeto"
git push