# Guia de Configuração e Execução Local

Este documento fornece instruções detalhadas sobre como configurar e executar o projeto localmente.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 14.x ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
- Um editor de código de sua preferência (recomendamos VSCode)

## Configuração do Ambiente

1. Clone o repositório para sua máquina local:
   ```bash
   git clone [https://github.com/Luanromancin/mentorIA-backend]
   cd mentorIA-backend
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie os seguintes arquivos na raiz do projeto:
     - `.env.development` para ambiente de desenvolvimento
     - `.env.test` para ambiente de testes
     - `.env.production` para ambiente de produção

## Scripts Disponíveis

O projeto inclui os seguintes scripts npm:

- **Iniciar em modo desenvolvimento:**
  ```bash
  npm start
  ```
  Este comando inicia o servidor em modo de desenvolvimento com hot-reload.

- **Construir o projeto:**
  ```bash
  npm run build
  ```
  Este comando compila o TypeScript para JavaScript na pasta `dist/`.

- **Executar em produção:**
  ```bash
  npm run prod
  ```
  Este comando executa a versão compilada do projeto.

- **Executar testes:**
  ```bash
  npm test
  ```
  Este comando executa os testes com cobertura usando Jest.

- **Formatar código:**
  ```bash
  npm run prettier
  ```
  Este comando formata o código usando Prettier.

- **Verificar e corrigir problemas de linting:**
  ```bash
  npm run lint
  ```
  Este comando executa o ESLint e corrige problemas automaticamente quando possível.

## Estrutura do Projeto

O projeto segue uma estrutura TypeScript padrão:
- `src/`: Código fonte da aplicação
- `tests/`: Arquivos de teste
- `dist/`: Código compilado (gerado após o build)

## Possíveis Erros Comuns e Soluções

### 1. Erro de Porta em Uso
**Problema:** A porta padrão já está sendo utilizada por outro processo.
**Solução:** Verifique se não há outras instâncias do servidor rodando e, se necessário, modifique a porta nas variáveis de ambiente.

### 2. Erro de Dependências
**Problema:** Módulos não encontrados ou conflitos de versão.
**Solução:** 
```bash
# Limpe o cache do npm
npm cache clean --force

# Remova a pasta node_modules e package-lock.json
rm -rf node_modules package-lock.json

# Reinstale as dependências
npm install
```

### 3. Erro de TypeScript
**Problema:** Erros de compilação TypeScript.
**Solução:** Verifique se todas as dependências de tipos (@types/*) estão instaladas corretamente e se o arquivo tsconfig.json está configurado adequadamente.

## Verificação da Instalação

Para verificar se tudo está funcionando corretamente:

1. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm start
   ```

2. O servidor deve iniciar sem erros e estar disponível no endereço local (geralmente http://localhost:[PORTA])

3. Execute os testes para garantir que tudo está funcionando:
   ```bash
   npm test
   ```

## Notas Adicionais

- O projeto utiliza `nodemon` para hot-reload durante o desenvolvimento
- A configuração do ESLint e Prettier já está incluída para manter a consistência do código
- O ambiente de teste está configurado com Jest e Supertest para testes de API
- Husky está configurado para garantir a qualidade do código antes dos commits 
