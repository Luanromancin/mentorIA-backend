# 🚀 MentorIA – Backend

## Projeto desenvolvido para Disciplina de Engenharia de Software da Universidade Federal de Pernambuco.

Backend da plataforma MentorIA, um tutor digital que identifica dificuldades, gera trilhas de treino personalizadas e guia estudantes até o domínio completo das competências para ENEM, podendo ser expandido para trilhas diferentes como ITA, IME, concursos e aprendizados variados, como computação.

> ✅ Este repositório corresponde **ao backend.** O frontend está disponível [aqui](https://github.com/gabrielalimasotero/MentorIA-Frontend).

## 🎯 Objetivos e Funcionalidades

### Objetivos Principais
- Transformar a forma como estudantes identificam seus pontos fortes e fracos
- Utilizar tecnologia, IA e gamificação para acelerar o progresso do aprendizado
- Criar uma experiência personalizada e adaptativa para cada estudante

### Funcionalidades Principais
- 📊 Dashboard de desempenho
- 🧠 Teste diagnóstico com análise de domínio
- 🎯 Trilhas inteligentes de estudo
- 🔄 Revisão inteligente baseada na curva do esquecimento
- 🔐 Sistema de autenticação e perfis
- 📱 Design responsivo e acessível
- 🏆 Gamificação com XP, conquistas e rankings
- 🚀 Revisão inteligente (spaced repetition) para retenção eficiente

## 🏗️ Arquitetura e Estrutura

### Diagrama C4
![Diagrama C4](diagrams/c4-diagram.png)

### Estrutura do Código
```plaintext
src/
├── controllers/    # Controladores da API
├── database/       # Configurações e migrações do banco de dados
├── entities/       # Entidades do domínio
├── models/         # Modelos de dados
├── repositories/   # Camada de acesso a dados
├── routes/         # Definição de rotas
├── services/       # Lógica de negócio
└── utils/          # Utilitários e helpers
```

## 🛠️ Tecnologias Utilizadas

| Camada       | Tecnologias                              |
|----------------|-------------------------------------------|
| *Frontend*  | Node.js + TypeScript (Framework como Next.js ou Vite) |
| *Backend*   | Node.js + Express + Prisma + TypeScript  |
| *Banco*     | PostgreSQL (Hospedado na nuvem — Railway ou Neon) |
| *Infraestrutura* | Railway (Backend + DB) + Vercel (Frontend) ou outro |
| *Gestão*    | GitHub Projects (Kanban e gestão ágil)   |

## 🚀 Guia de Build Local

### Pré-requisitos
- Node.js (v18+)
- npm
- PostgreSQL

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Luanromancin/mentorIA-backend.git
cd mentorIA-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o ambiente:
```bash
cp .env.example .env.dev
# Edite o arquivo .env.dev com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

5. Inicie o servidor:
```bash
npm run start:dev
```

A API estará disponível em: http://localhost:5001/api

### Testes
```bash
npm run test        # Executa todos os testes
npm run test:watch  # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
```

## 🤝 Como Contribuir

🤝 Como Contribuir
Faça um fork do repositório

Crie uma branch: git checkout -b feature/nome-da-feature

Faça commit das mudanças: git commit -m 'feat: minha nova funcionalidade'

Envie a branch: git push origin feature/nome-da-feature

Crie um Pull Request com uma descrição clara


Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

### Issues
- [Lista de Issues](https://github.com/Luanromancin/mentorIA-backend/issues)
- [Good First Issues](https://github.com/Luanromancin/mentorIA-backend/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)

## 📚 Recursos Importantes

- [Documentação da API](docs/api.md)
- [Workspace do Projeto](https://github.com/orgs/mentorIA/projects/1)
- [Ferramenta de Revisão de Código](https://github.com/Luanromancin/mentorIA-backend/pulls)
- [Rastreador de Problemas](https://github.com/Luanromancin/mentorIA-backend/issues)

## 👥 Equipe

- Antonio Gabriel - [GitHub](https://github.com/gabrielclemnt)
- Gabriela Lima Sotero - [GitHub](https://github.com/gabrielalimasotero)
- Luan Romancini - [GitHub](https://github.com/Luanromancin)
- Wilton Sales - [GitHub](https://github.com/WilSales)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [MockUp e PitchDeck](https://mentor-ia-learn.lovable.app/)
- [Documentação de Prompts](https://docs.google.com/document/d/1vQBVSXb1nNO8Fk_R4xubxmScVkbGHsDdypeyhnjqInc/edit?usp=sharing)


