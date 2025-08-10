# 🧪 Checklist - Teste de Nivelamento

## 📋 Pré-requisitos
- [ ] Backend rodando (`npm run dev`)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Script SQL executado no Supabase
- [ ] Questões inseridas na tabela `leveling_test_questions`

## 🔄 Teste 1: Cadastro e Primeiro Acesso

### 1.1 Cadastro de Novo Usuário
- [ ] Criar novo usuário via frontend
- [ ] Verificar se aparece na tabela `profiles` no Supabase
- [ ] Confirmar que `has_completed_leveling_test = false`

### 1.2 Login e Dashboard
- [ ] Fazer login com o usuário criado
- [ ] Verificar se é redirecionado para dashboard
- [ ] Confirmar que aparece botão "Iniciar Teste de Nivelamento"

## 🎯 Teste 2: Início do Teste

### 2.1 Iniciar Teste
- [ ] Clicar em "Iniciar Teste de Nivelamento"
- [ ] Verificar se questões são carregadas
- [ ] Confirmar que sessão é criada na tabela `leveling_test_sessions`

### 2.2 Responder Questões
- [ ] Responder algumas questões
- [ ] Verificar se respostas são salvas
- [ ] Confirmar que `current_question_index` é atualizado

## ⏸️ Teste 3: Pausa e Retorno

### 3.1 Pausar Teste
- [ ] Fazer logout durante o teste
- [ ] Verificar se sessão permanece ativa no banco

### 3.2 Retomar Teste
- [ ] Fazer login novamente
- [ ] Verificar se botão aparece como "Continuar Teste de Nivelamento"
- [ ] Confirmar que continua da questão correta

## 🏁 Teste 4: Finalização

### 4.1 Completar Teste
- [ ] Responder todas as questões
- [ ] Verificar se teste é finalizado
- [ ] Confirmar que `is_completed = true` na sessão

### 4.2 Verificar Resultados
- [ ] Confirmar que `has_completed_leveling_test = true` no perfil
- [ ] Verificar se competências foram criadas com níveis > 0
- [ ] Confirmar que botão muda para "Iniciar Treinamento"

## 🚀 Teste 5: Acesso à Apostila Dinâmica

### 5.1 Acesso Liberado
- [ ] Clicar em "Iniciar Treinamento"
- [ ] Verificar se acessa a apostila dinâmica
- [ ] Confirmar que não aparece mais botão de nivelamento

### 5.2 Persistência
- [ ] Fazer logout e login novamente
- [ ] Verificar se ainda tem acesso direto ao treinamento
- [ ] Confirmar que não precisa fazer nivelamento novamente

## 🔍 Verificações no Banco de Dados

### Tabela `profiles`
```sql
SELECT id, email, has_completed_leveling_test, created_at 
FROM profiles 
WHERE email = 'seu_email@teste.com';
```

### Tabela `leveling_test_sessions`
```sql
SELECT * FROM leveling_test_sessions 
WHERE profile_id = 'seu_user_id' 
ORDER BY created_at DESC;
```

### Tabela `user_competencies`
```sql
SELECT uc.level, c.name as competency_name
FROM user_competencies uc
JOIN competencies c ON uc.competency_id = c.id
WHERE uc.profile_id = 'seu_user_id';
```

## 🐛 Possíveis Problemas e Soluções

### Problema: Questões não carregam
- **Causa**: Tabela `leveling_test_questions` vazia
- **Solução**: Inserir questões de teste

### Problema: Sessão não é criada
- **Causa**: Tabela `leveling_test_sessions` não existe
- **Solução**: Executar script SQL

### Problema: Competências não são criadas
- **Causa**: Questões sem `competency_id` válido
- **Solução**: Verificar relacionamentos

### Problema: Flag não é atualizada
- **Causa**: Erro no método `markProfileAsCompleted`
- **Solução**: Verificar logs do backend

## 📊 Logs para Monitorar

### Backend
```bash
# Verificar logs do servidor
npm run dev

# Procurar por:
# - "Teste de nivelamento iniciado"
# - "Resposta registrada"
# - "Teste finalizado"
# - "Perfil marcado como completo"
```

### Frontend
```bash
# Abrir DevTools do navegador
# Verificar Console para erros
# Verificar Network para chamadas da API
```

## ✅ Critérios de Sucesso

- [ ] Usuário consegue fazer cadastro e login
- [ ] Teste de nivelamento inicia corretamente
- [ ] Questões são exibidas e podem ser respondidas
- [ ] Progresso é salvo e pode ser retomado
- [ ] Teste é finalizado com sucesso
- [ ] Flag é atualizada no banco
- [ ] Competências são criadas com níveis corretos
- [ ] Acesso à apostila dinâmica é liberado
- [ ] Estado persiste entre logins

## 🎯 Resultado Esperado

Após completar todos os testes, você deve ter:
1. ✅ Usuário com `has_completed_leveling_test = true`
2. ✅ Sessão de teste completada
3. ✅ Competências com níveis baseados no desempenho
4. ✅ Acesso direto à apostila dinâmica
5. ✅ Fluxo completo funcionando
