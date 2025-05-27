## 🗄️ Diagrama ER — Banco de Dados MentorAI

Este diagrama representa o modelo relacional do banco de dados do MentorIA.  
Ele define como os usuários, questões, respostas, habilidades e progresso estão relacionados.

```mermaid
erDiagram
    USUARIO {
        INT id PK
        STRING nome
        STRING email UNIQUE
        STRING senha_hash
        DATE data_criacao
    }
    SIMULADO {
        INT id PK
        STRING titulo
        DATE data_criacao
        INT usuario_id FK
    }
    QUESTAO {
        INT id PK
        STRING enunciado
        STRING alternativa_correta
        STRING materia
        STRING tema
        INT dificuldade
    }
    SIMULADO_QUESTAO {
        INT id PK
        INT simulado_id FK
        INT questao_id FK
    }
    HISTORICO {
        INT id PK
        INT usuario_id FK
        INT simulado_id FK
        INT acertos
        INT erros
        DATE data_execucao
    }

    USUARIO ||--o{ SIMULADO : possui
    SIMULADO ||--o{ SIMULADO_QUESTAO : contem
    QUESTAO ||--o{ SIMULADO_QUESTAO : esta_em
    USUARIO ||--o{ HISTORICO : gera
    SIMULADO ||--o{ HISTORICO : registrado_em
```
