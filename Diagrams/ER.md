## 🗄️ Diagrama ER — Banco de Dados MentorAI

Este diagrama representa o modelo relacional do banco de dados do MentorIA.  
Ele define como os usuários, questões, respostas, habilidades e progresso estão relacionados.

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nome
        string email UNIQUE
        string senha_hash
        date data_criacao
    }
    SIMULADO {
        int id PK
        string titulo
        date data_criacao
        int usuario_id FK
    }
    QUESTAO {
        int id PK
        string enunciado
        string alternativa_correta
        string materia
        string tema
        int dificuldade
    }
    SIMULADO_QUESTAO {
        int id PK
        int simulado_id FK
        int questao_id FK
    }
    HISTORICO {
        int id PK
        int usuario_id FK
        int simulado_id FK
        int acertos
        int erros
        date data_execucao
    }

    USUARIO ||--o{ SIMULADO : "possui"
    SIMULADO ||--o{ SIMULADO_QUESTAO : "contem"
    QUESTAO ||--o{ SIMULADO_QUESTAO : "esta_em"
    USUARIO ||--o{ HISTORICO : "gera"
    SIMULADO ||--o{ HISTORICO : "registrado_em"
```
