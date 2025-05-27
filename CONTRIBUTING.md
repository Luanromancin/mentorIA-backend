# Guia de Contribuição - Backend

Este guia irá te ajudar a configurar todo o ambiente necessário para contribuir com o backend do projeto, desde a instalação do Git até a configuração do ambiente de desenvolvimento.

## 1. Instalação do Git

### Windows
1. Acesse o site oficial do Git: https://git-scm.com/download/win
2. Baixe a versão para Windows
3. Execute o instalador e siga as instruções padrão
4. Após a instalação, abra o Git Bash e configure suas credenciais:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## 2. Instalação do Cursor.ia

1. Acesse o site oficial do Cursor: https://cursor.sh/
2. Baixe a versão para Windows
3. Execute o instalador
4. Após a instalação, abra o Cursor
5. Faça login com sua conta GitHub
6. Configure as extensões recomendadas:
   - ESLint
   - Prettier
   - GitLens

## 3. Instalação do Node.js e npm

1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador
4. Após a instalação, verifique se está tudo correto:
```bash
node --version
npm --version
```

## 4. Instalação do PostgreSQL e pgAdmin

### PostgreSQL
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe o instalador
3. Durante a instalação:
   - Anote a senha do usuário postgres
   - Mantenha a porta padrão (5432)
   - Instale o pgAdmin quando solicitado

### pgAdmin
1. Se não foi instalado junto com o PostgreSQL, baixe em: https://www.pgadmin.org/download/windows/
2. Execute o instalador
3. Após a instalação, abra o pgAdmin
4. Configure uma nova conexão:
   - Host: localhost
   - Porta: 5432
   - Usuário: postgres
   - Senha: (a senha definida durante a instalação do PostgreSQL)

## 5. Clonando o Repositório Backend

1. Abra o Git Bash
2. Navegue até a pasta onde deseja clonar o projeto
3. Execute o comando:
```bash
git clone https://github.com/seu-usuario/backend.git
cd backend
```

## 6. Configurando o Ambiente de Desenvolvimento

1. Abra o projeto no Cursor.ia
2. Instale as dependências do projeto:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias:
     ```
     DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/nome_do_banco
     JWT_SECRET=sua_chave_secreta
     PORT=3000
     ```

4. Execute as migrações do banco de dados:
```bash
npm run migrate
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 7. Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/    # Controladores da aplicação
│   ├── models/        # Modelos do banco de dados
│   ├── routes/        # Rotas da API
│   ├── middlewares/   # Middlewares
│   ├── services/      # Lógica de negócios
│   └── utils/         # Funções utilitárias
├── tests/             # Testes automatizados
├── prisma/            # Configuração do Prisma
└── package.json       # Dependências e scripts
```

## 8. Fluxo de Trabalho

1. Crie uma nova branch para suas alterações:
```bash
git checkout -b feature/nome-da-sua-feature
```

2. Faça suas alterações e commits:
```bash
git add .
git commit -m "Descrição das alterações"
```

3. Envie suas alterações:
```bash
git push origin feature/nome-da-sua-feature
```

4. Crie um Pull Request no GitHub

## 9. Boas Práticas

- Siga os princípios REST na criação de endpoints
- Documente todas as rotas usando Swagger/OpenAPI
- Escreva testes unitários e de integração
- Mantenha o código organizado e bem documentado
- Siga os padrões de código do projeto
- Atualize a documentação quando necessário

## 10. Testes

Execute os testes antes de enviar suas alterações:
```bash
npm test
```

## 11. Suporte

Se encontrar algum problema durante a configuração:
1. Verifique a documentação do projeto
2. Abra uma issue no GitHub
3. Entre em contato com a equipe de desenvolvimento

## 12. Convenções de Código

- Use camelCase para nomes de variáveis e funções
- Use PascalCase para nomes de classes e interfaces
- Use UPPER_SNAKE_CASE para constantes
- Mantenha as linhas com no máximo 80 caracteres
- Use 2 espaços para indentação
- Adicione ponto e vírgula no final das instruções
