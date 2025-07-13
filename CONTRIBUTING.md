# 🚀 Guia de Contribuição - MentorIA-Frontend

Bem-vindo(a) ao guia de contribuição do **MentorIA-Frontend**! Este documento irá te ajudar a configurar todo o ambiente necessário para começar a desenvolver, desde a instalação das ferramentas essenciais até o processo de submissão do seu código.

---

## 1. Ferramentas Essenciais

Para começar, você precisará de algumas ferramentas básicas em seu computador.

### 1.1. Instalação do Git

Git é um sistema de controle de versão fundamental para gerenciar as mudanças no código do projeto.

#### **Para Windows:**

1. Acesse o site oficial do Git: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Baixe o instalador da versão mais recente para Windows.
3. Execute o instalador e siga as instruções, aceitando as opções padrão na maioria dos casos.
4. Após a instalação, abra o **Git Bash** (um terminal que veio com a instalação do Git) e configure suas credenciais globais:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

#### **Para macOS:**

1. Abra o **Terminal** (você pode encontrá-lo pesquisando no Spotlight ou em Aplicativos > Utilitários).
2. Instale as ferramentas de linha de comando do Xcode, que incluem o Git:

```bash
xcode-select --install
```

Uma janela pop-up aparecerá. Clique em "Instalar" e siga as instruções.

#### **Para Linux (Debian/Ubuntu, Fedora, Arch Linux):**

Abra o **Terminal** e use o gerenciador de pacotes da sua distribuição:

- **Debian/Ubuntu:**

```bash
sudo apt update
sudo apt install git
```

- **Fedora:**

```bash
sudo dnf install git
```

- **Arch Linux:**

```bash
sudo pacman -S git
```

**Verificar a Instalação do Git:**

Após a instalação, digite:

```bash
git --version
```

Você deverá ver a versão do Git instalada, por exemplo: `git version 2.40.1`.

---

### 1.2. Instalação do Node.js e npm

Node.js é o ambiente de execução JavaScript que o projeto utiliza, e o npm (Node Package Manager) é o gerenciador de pacotes que vem junto com o Node.js.

1. Acesse o site oficial do Node.js: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
2. Baixe a versão **LTS (Long Term Support)**, que é a mais estável.
3. Execute o instalador baixado e siga as instruções padrão.
4. Após a instalação, verifique se o Node.js e o npm foram instalados corretamente:

```bash
node -v
npm -v
```

Você deverá ver as versões instaladas, por exemplo: `v18.17.1` para Node.js e `9.6.7` para npm.

---

### 1.3. Escolha e Configuração do Editor de Código (VS Code Recomendado)

Um bom editor de código é essencial para sua produtividade. Recomendamos o **Visual Studio Code (VS Code)** pela sua flexibilidade e vasta gama de extensões.

1. Acesse o site oficial do VS Code: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Baixe a versão para o seu sistema operacional.
3. Execute o instalador e siga as instruções.
4. Após a instalação, abra o VS Code. Considere instalar as seguintes extensões recomendadas:
   - **ESLint**: Ajuda a identificar e corrigir problemas de formatação e estilo de código JavaScript/TypeScript.
   - **Prettier**: Formatador de código automático.
   - **GitLens**: Melhora as capacidades Git integradas do VS Code.
   - **React Extension Pack** (ou similar): Conjunto de extensões úteis para desenvolvimento React.

---

## 2. Configurando o Ambiente de Desenvolvimento

Com as ferramentas essenciais instaladas, vamos configurar o projeto **MentorIA-Frontend**.

### 2.1. Fazendo o Fork do Repositório

1. Acesse o repositório principal do MentorIA-Frontend no GitHub: [https://github.com/gabrielalimasotero/MentorIA-Frontend](https://github.com/gabrielalimasotero/MentorIA-Frontend)
2. No canto superior direito, clique em **Fork**.
3. Siga as instruções do GitHub para criar sua cópia.

### 2.2. Clonando o Seu Fork para o Seu Computador

1. No seu repositório "forkado" no GitHub, clique em **Code** e copie a URL (HTTPS).
2. Abra seu **Terminal** (Linux/macOS) ou **Git Bash** (Windows).
3. Navegue até a pasta onde deseja armazenar o projeto:

```bash
cd ~/Documentos/Projetos
```

Se a pasta não existir, crie-a:

```bash
mkdir -p ~/Documentos/Projetos
cd ~/Documentos/Projetos
```

4. Clone o repositório:

```bash
git clone SUA_URL_COPIADA_DO_GITHUB
# Exemplo: git clone https://github.com/SEU_USUARIO/MentorIA-Frontend.git
```

### 2.3. Instalando as Dependências do Projeto

1. Entre na pasta do projeto:

```bash
cd MentorIA-Frontend
```

2. Instale todas as dependências usando o npm:

```bash
npm install
```

3. Para corrigir vulnerabilidades (opcional):

```bash
npm audit fix
```

### 2.4. Rodando o Projeto em Ambiente de Desenvolvimento

1. Na pasta do projeto, execute:

```bash
npm run dev
```

2. O terminal mostrará o endereço local, por exemplo:

```
➜  Local:    http://localhost:8080/
```

3. Abra seu navegador e acesse o endereço informado.

> **Importante:** Mantenha o terminal aberto enquanto estiver trabalhando. Para parar o servidor, pressione `Ctrl + C` no terminal.

---

## 3. Estrutura do Projeto

```
MentorIA-Frontend/
├── public/                # Arquivos estáticos (ícones, imagens)
├── src/
│   ├── assets/            # Imagens, fontes e outros recursos estáticos
│   ├── components/        # Componentes reutilizáveis da UI
│   ├── layouts/           # Estruturas de layout de páginas
│   ├── pages/             # Componentes de página/tela
│   ├── services/          # Funções para interagir com APIs (backend)
│   ├── utils/             # Funções utilitárias e helpers
│   ├── App.tsx            # Componente principal da aplicação
│   ├── main.tsx           # Ponto de entrada da aplicação React
│   └── index.css          # Estilos globais
├── tests/                 # Arquivos de teste (se existirem)
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts do projeto
├── tsconfig.json          # Configuração do TypeScript
├── vite.config.ts         # Configuração do Vite
└── README.md              # Documentação geral do projeto
```

---

## 4. Fluxo de Trabalho de Contribuição

Seguimos um fluxo de trabalho padrão do Git para organizar as contribuições.

### 4.1. Crie uma Nova Branch (Ramificação)

Antes de fazer qualquer alteração no código, crie uma nova branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-sua-funcionalidade
# Exemplo: git checkout -b feature/adicionar-filtro-mentores
```

Para correção de bugs:

```bash
git checkout -b bugfix/nome-do-seu-bug
# Exemplo: git checkout -b bugfix/corrigir-layout-mobile
```

### 4.2. Faça Suas Alterações no Código

Implemente suas mudanças seguindo o estilo de código do projeto.

### 4.3. Teste Suas Alterações

Antes de enviar seu código, teste suas mudanças para garantir que funcionam corretamente.

### 4.4. Faça o Commit de Suas Alterações

Adicione todos os arquivos modificados:

```bash
git add .
```

Faça o commit usando o padrão Conventional Commits:

```bash
git commit -m "feat: Adiciona componente de card para mentor"
# (Para uma nova funcionalidade)

git commit -m "fix: Corrige erro de renderizacao de imagem de perfil"
# (Para uma correção de bug)
```

Outros prefixos comuns: `docs:`, `style:`, `refactor:`, `test:`, `chore:`

### 4.5. Envie Sua Branch para o GitHub

```bash
git push origin nome-da-sua-branch
# Exemplo: git push origin feature/adicionar-card-mentor
```

### 4.6. Abra um Pull Request (PR)

1. Vá para o seu repositório "forkado" no GitHub.
2. Clique em **Compare & pull request** ou **New pull request**.
3. Preencha o título e a descrição, seguindo o padrão de Conventional Commits.
4. Se o PR resolver uma Issue, mencione-a: `Closes #NUMERO_DA_ISSUE`.

### 4.7. Revisão de Código

Seu PR será revisado pelos mantenedores. Responda aos feedbacks e faça ajustes se necessário. Após aprovação, ele será mesclado na branch principal.

---

## 5. Boas Práticas e Convenções

- **Padrões de Código:** Use ESLint e Prettier para manter a formatação e o estilo.
- **Nomeclatura:**
  - camelCase para variáveis e funções.
  - PascalCase para componentes React e classes.
  - UPPER_SNAKE_CASE para constantes globais.
- **Componentes:** Mantenha-os pequenos e reutilizáveis.
- **Legibilidade:** Escreva código claro e adicione comentários quando necessário.
- **Testes:** Sempre que possível, escreva testes para novas funcionalidades ou correções.

---

## 6. Suporte

Se encontrar problemas:

- Revise este guia.
- Pesquise em sites como Stack Overflow ou na documentação oficial das ferramentas.
- Abra uma **Issue** no GitHub, descrevendo seu problema detalhadamente.

---

Muito obrigado pela sua contribuição! Seu trabalho é fundamental para o sucesso do **MentorIA-Frontend**.