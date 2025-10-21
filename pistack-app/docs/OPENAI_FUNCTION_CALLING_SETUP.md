# 🤖 Configuração de Function Calling nos OpenAI Assistants

Este documento explica como configurar as **functions** (tools) nos 6 OpenAI Assistants do PIStack para permitir que a IA crie e edite cards automaticamente.

## 📋 Overview

Cada um dos 6 assistants especializados (Ideation, Discovery, Scope, Design, Tech, Planning) deve ter as mesmas 5 functions configuradas.

## 🔧 Functions para Configurar

### 1. create_card
Permite que a IA crie novos cards no canvas.

```json
{
  "name": "create_card",
  "description": "Cria um novo card no canvas do PIStack",
  "parameters": {
    "type": "object",
    "properties": {
      "stage": {
        "type": "integer",
        "description": "Numero da etapa (1 a 6)",
        "enum": [1, 2, 3, 4, 5, 6]
      },
      "card_type": {
        "type": "string",
        "description": "Tipo do card (ex: project-name, pitch, problem, solution, etc)"
      },
      "content": {
        "type": "object",
        "description": "Conteudo do card em formato JSON"
      }
    },
    "required": ["stage", "card_type", "content"]
  }
}
```

### 2. update_card
Permite que a IA atualize cards existentes.

```json
{
  "name": "update_card",
  "description": "Atualiza um card existente",
  "parameters": {
    "type": "object",
    "properties": {
      "card_id": {
        "type": "string",
        "description": "ID unico do card"
      },
      "content": {
        "type": "object",
        "description": "Novo conteudo do card"
      }
    },
    "required": ["card_id", "content"]
  }
}
```

### 3. suggest_content
Permite que a IA obtenha contexto do projeto para fazer sugestões.

```json
{
  "name": "suggest_content",
  "description": "Sugere conteudo para um tipo de card especifico baseado no contexto do projeto",
  "parameters": {
    "type": "object",
    "properties": {
      "card_type": {
        "type": "string",
        "description": "Tipo do card"
      },
      "context": {
        "type": "string",
        "description": "Contexto adicional para a sugestao"
      }
    },
    "required": ["card_type"]
  }
}
```

### 4. validate_stage
Permite que a IA valide se uma etapa está completa.

```json
{
  "name": "validate_stage",
  "description": "Valida se uma etapa esta completa e consistente",
  "parameters": {
    "type": "object",
    "properties": {
      "stage": {
        "type": "integer",
        "description": "Numero da etapa (1 a 6)",
        "enum": [1, 2, 3, 4, 5, 6]
      },
      "project_id": {
        "type": "string",
        "description": "ID do projeto"
      }
    },
    "required": ["stage", "project_id"]
  }
}
```

### 5. get_project_context
Permite que a IA obtenha todos os cards preenchidos do projeto.

```json
{
  "name": "get_project_context",
  "description": "Obtem o contexto completo do projeto incluindo todos os cards preenchidos",
  "parameters": {
    "type": "object",
    "properties": {
      "project_id": {
        "type": "string",
        "description": "ID do projeto"
      }
    },
    "required": ["project_id"]
  }
}
```

## 🚀 Como Configurar na OpenAI Platform

Para **CADA** um dos 6 assistants:

1. Acesse [OpenAI Platform](https://platform.openai.com/assistants)
2. Clique no assistant que deseja configurar
3. Vá para a seção **Tools**
4. Clique em **Add Tool** → **Function**
5. Cole o JSON da function (começando com `create_card`)
6. Clique em **Save**
7. Repita os passos 4-6 para as outras 4 functions

### Assistants que precisam das functions:

- ✅ **Ideation Assistant** (Etapa 1) - `OPENAI_ASSISTANT_IDEATION`
- ✅ **Discovery Assistant** (Etapa 2) - `OPENAI_ASSISTANT_DISCOVERY`
- ✅ **Scope Assistant** (Etapa 3) - `OPENAI_ASSISTANT_SCOPE`
- ✅ **Design Assistant** (Etapa 4) - `OPENAI_ASSISTANT_DESIGN`
- ✅ **Tech Assistant** (Etapa 5) - `OPENAI_ASSISTANT_TECH`
- ✅ **Planning Assistant** (Etapa 6) - `OPENAI_ASSISTANT_PLANNING`

## 📝 Tipos de Cards por Etapa

### Etapa 1: Ideia Base
- `project-name` - Nome e descrição do projeto
- `pitch` - Elevator pitch
- `problem` - Problema que resolve
- `solution` - Solução proposta
- `target-audience` - Público-alvo
- `initial-kpis` - KPIs iniciais

### Etapa 2: Entendimento
- `validation-hypotheses` - Hipóteses de validação
- `primary-persona` - Persona principal
- `value-proposition` - Proposta de valor
- `benchmarking` - Análise de concorrentes

### Etapa 3: Escopo
- `mvp-definition` - Definição do MVP
- `essential-features` - Features essenciais
- `user-stories` - User stories
- `acceptance-criteria` - Critérios de aceitação
- `roadmap` - Roadmap de desenvolvimento
- `scope-constraints` - Restrições de escopo

### Etapa 4: Design
- `user-flows` - Fluxos de usuário
- `wireframes` - Wireframes
- `design-system` - Sistema de design
- `components` - Componentes reutilizáveis
- `accessibility` - Acessibilidade

### Etapa 5: Tech
- `tech-stack` - Stack tecnológica
- `architecture` - Arquitetura do sistema
- `database` - Modelo de dados
- `api-design` - Design de APIs
- `infrastructure` - Infraestrutura
- `security` - Segurança

### Etapa 6: Planejamento
- `sprint-planning` - Planejamento de sprints
- `timeline` - Cronograma
- `resources` - Recursos e equipe
- `budget` - Orçamento
- `milestones` - Marcos do projeto
- `success-criteria` - Critérios de sucesso
- `risk-management` - Gestão de riscos
- `launch-plan` - Plano de lançamento

## 🎯 Exemplos de Uso

### Exemplo 1: Criar um card
**Usuário:** "Pode preencher o card de problema para mim?"

**Assistant chama:**
```json
{
  "function": "create_card",
  "arguments": {
    "stage": 1,
    "card_type": "problem",
    "content": {
      "problem": "Usuários têm dificuldade em organizar suas ideias de projeto de forma estruturada..."
    }
  }
}
```

### Exemplo 2: Atualizar um card existente
**Usuário:** "Melhore o pitch do projeto"

**Assistant primeiro chama:**
```json
{
  "function": "get_project_context",
  "arguments": {
    "project_id": "abc-123"
  }
}
```

**Depois chama:**
```json
{
  "function": "update_card",
  "arguments": {
    "card_id": "card-xyz",
    "content": {
      "pitch": "PIStack é uma plataforma de co-criação com IA que transforma ideias em projetos estruturados..."
    }
  }
}
```

### Exemplo 3: Validar etapa
**Usuário:** "A etapa 1 está completa?"

**Assistant chama:**
```json
{
  "function": "validate_stage",
  "arguments": {
    "stage": 1,
    "project_id": "abc-123"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "stage": 1,
  "is_complete": false,
  "completion_percentage": 66,
  "missing_cards": ["initial-kpis"],
  "empty_cards": ["solution"],
  "message": "Stage 1 is 66% complete. 1 cards missing, 1 cards empty."
}
```

## ✅ Verificação

Após configurar, teste cada assistant enviando uma mensagem como:

**"Crie um card de pitch com o seguinte conteúdo: [seu texto]"**

Se a configuração estiver correta:
1. O assistant vai chamar a function `create_card`
2. O backend vai executar a função
3. O card será criado no banco de dados
4. O assistant vai responder confirmando a criação

## 🐛 Troubleshooting

### Erro: "Unknown function"
- Verifique se o nome da function está exatamente como especificado
- Verifique se a function foi adicionada ao assistant correto

### Erro: "Card type not valid for stage"
- Verifique se o card_type corresponde à etapa correta
- Consulte a lista de card types por etapa acima

### Erro: "Card already exists"
- Use `update_card` em vez de `create_card` para cards existentes
- Ou peça ao assistant para atualizar em vez de criar

## 📚 Recursos

- [OpenAI Assistants API - Function Calling](https://platform.openai.com/docs/assistants/tools/function-calling)
- [PIStack Function Handlers](../lib/ai/function-handlers.ts)
- [PIStack Function Definitions](../lib/ai/functions.ts)
