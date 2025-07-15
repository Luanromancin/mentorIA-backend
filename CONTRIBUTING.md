# 🚀 Guia de Contribuição - MentorIA (Backend & Frontend)

Bem-vindo(a) ao guia de contribuição dos projetos **MentorIA-Backend** e **MentorIA-Frontend**!
Este documento centraliza as orientações para contribuir em ambos os repositórios.

---

## 1. Ferramentas Essenciais

Para começar, você precisará de algumas ferramentas básicas em seu computador.

### 1.1. Instalação do Git

Siga as instruções para seu sistema operacional:

- [Guia oficial do Git](https://git-scm.com/downloads)

Após instalar, configure suas credenciais globais:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 1.2. Instalação do Node.js e npm

Baixe a versão **LTS** do Node.js em [https://nodejs.org/en/download/](https://nodejs.org/en/download/).
Após instalar, verifique:

```bash
node -v
npm -v
```

### 1.3. Editor de Código (VS Code Recomendado)

Recomendamos o **Visual Studio Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

Extensões sugeridas:
- ESLint
- Prettier
- GitLens
- (Para frontend) React Extension Pack

---

## 2. Clonando os Repositórios

Você pode contribuir tanto para o backend quanto para o frontend. Faça o fork e clone conforme o projeto desejado:

### 2.1. Backend
- Repositório: [https://github.com/Luanromancin/mentorIA-backend.git](https://github.com/Luanromancin/mentorIA-backend.git)
- Comando:
  ```bash
  git clone https://github.com/SEU_USUARIO/mentorIA-backend.git
  ```

### 2.2. Frontend
- Repositório: [https://github.com/gabrielalimasotero/mentorIA-front.git](https://github.com/gabrielalimasotero/mentorIA-front.git)
- Comando:
  ```bash
  git clone https://github.com/SEU_USUARIO/MentorIA-front.git
  ```

---

## 3. Instalando Dependências

### Backend
```bash
cd mentorIA-backend
npm install
```

### Frontend
```bash
cd MentorIA-Frontend
npm install
```

---

## 4. Rodando o Projeto em Ambiente de Desenvolvimento

### Backend
```bash
npm run dev
```

### Frontend
```bash
npm run dev
```

O terminal mostrará o endereço local, por exemplo:
```
➜  Local:    http://localhost:8080/
```
Abra seu navegador e acesse o endereço informado.

> **Importante:** Mantenha o terminal aberto enquanto estiver trabalhando. Para parar o servidor, pressione `Ctrl + C` no terminal.

---

## 5. Estrutura dos Projetos

### Backend
```
mentorIA-backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   └── ...
└── ...
```

### Frontend
```
MentorIA-Frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── tests/
└── ...
```

---

## 6. Fluxo de Trabalho de Contribuição

O fluxo de contribuição é o mesmo para ambos os projetos:

### 6.1. Crie uma Nova Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-sua-funcionalidade
# ou para correção de bugs
git checkout -b bugfix/nome-do-seu-bug
```

### 6.2. Faça Suas Alterações no Código
Implemente suas mudanças seguindo o estilo de código do projeto.

### 6.3. Teste Suas Alterações
Antes de enviar seu código, teste suas mudanças para garantir que funcionam corretamente.

### 6.4. Faça o Commit de Suas Alterações

```bash
git add .
git commit -m "feat: Descrição da sua funcionalidade"
# ou
git commit -m "fix: Descrição da correção"
```

Outros prefixos comuns: `docs:`, `style:`, `refactor:`, `test:`, `chore:`

### 6.5. Envie Sua Branch para o GitHub

```bash
git push origin nome-da-sua-branch
```

### 6.6. Abra um Pull Request (PR)

1. Vá para o seu repositório "forkado" no GitHub.
2. Clique em **Compare & pull request** ou **New pull request**.
3. Preencha o título e a descrição, seguindo o padrão de Conventional Commits.
4. Se o PR resolver uma Issue, mencione-a: `Closes #NUMERO_DA_ISSUE`.

### 6.7. Revisão de Código
Seu PR será revisado pelos mantenedores. Responda aos feedbacks e faça ajustes se necessário. Após aprovação, ele será mesclado na branch principal.

---

## 7. Boas Práticas e Convenções

- **Padrões de Código:** Use ESLint e Prettier para manter a formatação e o estilo.
- **Nomeclatura:**
  - camelCase para variáveis e funções.
  - PascalCase para componentes React (frontend) e classes.
  - UPPER_SNAKE_CASE para constantes globais.
- **Componentes (frontend):** Mantenha-os pequenos e reutilizáveis.
- **Legibilidade:** Escreva código claro e adicione comentários quando necessário.
- **Testes:** Sempre que possível, escreva testes para novas funcionalidades ou correções.
- **Backend:**
  - Siga a estrutura de pastas proposta.
  - Utilize boas práticas de API REST.
  - Documente endpoints e regras de negócio quando necessário.
- **Frontend:**
  - Utilize componentes reutilizáveis.
  - Separe lógica de apresentação.
  - Utilize hooks e boas práticas do React.

---

## 8. Suporte

Se encontrar problemas:
- Revise este guia.
- Pesquise em sites como Stack Overflow ou na documentação oficial das ferramentas.
- Abra uma **Issue** no repositório correspondente (backend ou frontend), descrevendo seu problema detalhadamente.

---

Muito obrigado pela sua contribuição! Seu trabalho é fundamental para o sucesso do **MentorIA**.

---

> **Observação:** Este arquivo está centralizado no repositório do backend, mas serve para ambos os projetos. Consulte sempre este guia antes de contribuir.
