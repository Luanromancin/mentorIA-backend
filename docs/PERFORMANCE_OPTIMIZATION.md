# 🚀 Otimização de Performance - Sistema de Competências

## 📊 Problema Atual

### Performance Issues:
- **265 competências** por usuário
- **265 INSERTs** na criação de usuário (~5-10s)
- **265 SELECTs** para consultar status (~2-3s)
- **Escalabilidade linear** - piora com mais usuários

### Estrutura Atual:
```sql
-- Tabela atual (problemática)
user_competencies (
  profile_id uuid,
  competency_id uuid,
  level integer,
  last_evaluated_at timestamp
)
```

## 🎯 Soluções Propostas

### **Opção 1: Competências Lazy Loading (Recomendada)**

#### Conceito:
- **NÃO inicializar** competências na criação do usuário
- Criar competências **apenas quando necessário**
- Usar **nível padrão** para competências não criadas

#### Estrutura Otimizada:
```sql
-- Tabela otimizada
user_competencies (
  profile_id uuid,
  competency_id uuid,
  level integer DEFAULT 0,
  last_evaluated_at timestamp DEFAULT NOW(),
  created_at timestamp DEFAULT NOW()
)

-- Índices para performance
CREATE INDEX idx_user_competencies_profile ON user_competencies(profile_id);
CREATE INDEX idx_user_competencies_competency ON user_competencies(competency_id);
CREATE INDEX idx_user_competencies_composite ON user_competencies(profile_id, competency_id);
```

#### Vantagens:
- ✅ **Criação instantânea** de usuário
- ✅ **Competências sob demanda**
- ✅ **Cache inteligente**
- ✅ **Escalabilidade exponencial**

### **Opção 2: Competências em JSON (Alternativa)**

#### Conceito:
- Armazenar competências como **JSON** no perfil
- **Uma consulta** para todas as competências
- **Atualização atômica** do JSON

#### Estrutura:
```sql
-- Adicionar ao profiles
profiles (
  id uuid,
  email text,
  name text,
  competencies_json jsonb DEFAULT '{}',
  -- outros campos...
)

-- Índice GIN para consultas JSON
CREATE INDEX idx_profiles_competencies_gin ON profiles USING GIN (competencies_json);
```

#### Vantagens:
- ✅ **Uma consulta** para todas competências
- ✅ **Atualização atômica**
- ✅ **Flexibilidade total**

#### Desvantagens:
- ❌ **Menos normalizado**
- ❌ **Consultas complexas** para filtros

### **Opção 3: Competências Agrupadas (Híbrida)**

#### Conceito:
- Agrupar competências por **categoria/área**
- Criar **resumos** por grupo
- **Detalhes** sob demanda

#### Estrutura:
```sql
-- Resumo por categoria
user_competency_summaries (
  profile_id uuid,
  category_id uuid,
  total_competencies integer,
  completed_competencies integer,
  average_level numeric,
  last_updated timestamp
)

-- Detalhes (lazy loading)
user_competency_details (
  profile_id uuid,
  competency_id uuid,
  level integer,
  last_evaluated_at timestamp
)
```

## 🎯 **Recomendação: Opção 1 (Lazy Loading)**

### **Implementação:**

#### 1. Modificar Criação de Usuário:
```typescript
// NÃO inicializar competências na criação
async register(data: RegisterData): Promise<AuthResponse> {
  // ... criar usuário e perfil
  // ❌ REMOVER: await this.initializeUserCompetencies(profile.id);
  // ✅ Usuário criado instantaneamente
}
```

#### 2. Sistema de Cache Inteligente:
```typescript
class CompetencyCache {
  private cache = new Map<string, UserCompetency[]>();
  
  async getUserCompetencies(profileId: string): Promise<UserCompetency[]> {
    // 1. Verificar cache
    if (this.cache.has(profileId)) {
      return this.cache.get(profileId)!;
    }
    
    // 2. Buscar do banco
    const competencies = await this.loadFromDatabase(profileId);
    
    // 3. Popular cache
    this.cache.set(profileId, competencies);
    
    return competencies;
  }
  
  private async loadFromDatabase(profileId: string): Promise<UserCompetency[]> {
    // Buscar apenas competências que existem
    const existing = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', profileId);
      
    // Para competências não existentes, usar nível 0 padrão
    return this.mergeWithDefaults(existing.data || []);
  }
}
```

#### 3. Criação Sob Demanda:
```typescript
async getCompetencyLevel(profileId: string, competencyId: string): Promise<number> {
  // 1. Verificar se existe
  const { data: existing } = await supabase
    .from('user_competencies')
    .select('level')
    .eq('profile_id', profileId)
    .eq('competency_id', competencyId)
    .single();
    
  if (existing) {
    return existing.level;
  }
  
  // 2. Criar com nível 0 se não existir
  await supabase
    .from('user_competencies')
    .insert({
      profile_id: profileId,
      competency_id: competencyId,
      level: 0,
      last_evaluated_at: new Date().toISOString()
    });
    
  return 0;
}
```

### **Benefícios da Otimização:**

#### Performance:
- ✅ **Criação de usuário**: ~100ms (vs 5-10s)
- ✅ **Consulta de competências**: ~50ms (vs 2-3s)
- ✅ **Escalabilidade**: Constante (vs Linear)

#### Experiência do Usuário:
- ✅ **Registro instantâneo**
- ✅ **Navegação fluida**
- ✅ **Resposta rápida**

#### Manutenibilidade:
- ✅ **Código mais simples**
- ✅ **Menos complexidade**
- ✅ **Debugging mais fácil**

## 🔧 **Plano de Implementação:**

### **Fase 1: Preparação**
1. Criar índices de performance
2. Implementar sistema de cache
3. Modificar criação de usuário

### **Fase 2: Migração**
1. Implementar lazy loading
2. Testar performance
3. Validar funcionalidade

### **Fase 3: Otimização**
1. Monitorar performance
2. Ajustar cache
3. Documentar mudanças

## 📈 **Métricas Esperadas:**

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Criação de usuário | 5-10s | 100ms | **50-100x** |
| Consulta competências | 2-3s | 50ms | **40-60x** |
| Uso de memória | Alto | Baixo | **80% menos** |
| Escalabilidade | Linear | Constante | **Exponencial** |

## 🎯 **Próximos Passos:**

1. **Implementar lazy loading**
2. **Adicionar sistema de cache**
3. **Criar índices de performance**
4. **Testar com dados reais**
5. **Monitorar performance**

---

**Resultado Esperado:** Sistema 50-100x mais rápido com melhor escalabilidade! 🚀 