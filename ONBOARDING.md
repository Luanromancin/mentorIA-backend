# Guia de Onboarding para Desenvolvedores

Bem-vindo ao projeto! Siga este passo a passo para configurar seu ambiente, rodar a aplicação, executar os testes e validar que tudo está funcionando corretamente após um `git pull` da branch `main`.

---

## 1. Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (versão 8 ou superior)
- **Git**
- (Opcional) **Docker** para rodar banco de dados localmente

---

## 2. Instalando as dependências
Execute no terminal, na raiz do projeto:

```sh
npm install
```

---

## 3. Configurando variáveis de ambiente
- Copie o arquivo de exemplo:
  ```sh
  cp env.supabase.example .env
  ```
- Preencha as variáveis necessárias no arquivo `.env` com as credenciais do Supabase e outras configurações.
- Para rodar os testes, use o arquivo `.env.test.example` como base.

---

## 4. Rodando a aplicação
Para ambiente de desenvolvimento:

```sh
npm start
```

A API estará disponível em `http://localhost:3000` (ou na porta definida no `.env`).

---

## 5. Executando os testes
O projeto possui testes automatizados (unitários, integração e BDD):

- **Rodar todos os testes:**
  ```sh
  npm test
  ```
- **Cobertura de testes:**
  ```sh
  npm run test:coverage
  ```
- **Testes de integração:**
  ```sh
  npm run test:integration
  ```
- **Testes específicos do Supabase:**
  ```sh
  npm run test:supabase
  ```

---

## 6. Validação completa do projeto
Para rodar todas as validações (formatação, lint, tipos, testes e cobertura):

```sh
npm run validate:fix
```

---

## 7. Dicas úteis
- Consulte a documentação em `/docs` para detalhes de endpoints, integração e exemplos de uso.
- Use o script de validação antes de abrir um PR.
- Se tiver problemas com variáveis de ambiente, revise os arquivos `.env.example`.

---

## 8. Fluxo recomendado
1. Faça um `git pull origin main` para atualizar seu repositório local.
2. Instale as dependências com `npm install`.
3. Configure o `.env`.
4. Rode os testes e a aplicação.
5. Consulte este arquivo sempre que tiver dúvidas!

---

**Bem-vindo ao time e bons commits!** 