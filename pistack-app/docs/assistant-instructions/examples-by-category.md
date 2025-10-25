# Card Generation Examples by Category

This document provides comprehensive examples of card generation for each category, helping the AI assistant understand patterns and best practices.

## Ideation Category

### Example 1: Problem Statement

**Input**: "Create a card to document problems we're trying to solve"

**Output**:
```json
{
  "name": "Declaração de Problema",
  "fields": [
    {
      "name": "Qual é o problema?",
      "type": "textarea",
      "placeholder": "Descreva o problema central que você identificou",
      "required": true
    },
    {
      "name": "Quem enfrenta este problema?",
      "type": "text",
      "placeholder": "Ex: Pequenos empreendedores, Estudantes universitários",
      "required": true
    },
    {
      "name": "Qual o impacto deste problema?",
      "type": "textarea",
      "placeholder": "Como este problema afeta as pessoas?",
      "required": false
    },
    {
      "name": "Frequência",
      "type": "select",
      "options": ["Diariamente", "Semanalmente", "Mensalmente", "Ocasionalmente"],
      "required": false
    }
  ],
  "suggestion": "Card focado em documentar problemas de forma estruturada, essencial para fase de ideação e descoberta."
}
```

### Example 2: Opportunity Canvas

**Input**: "Want to explore business opportunities with market size and competition"

**Output**:
```json
{
  "name": "Canvas de Oportunidade",
  "fields": [
    {
      "name": "Nome da Oportunidade",
      "type": "text",
      "placeholder": "Ex: Automatização de atendimento",
      "required": true
    },
    {
      "name": "Descrição",
      "type": "textarea",
      "placeholder": "Descreva a oportunidade identificada",
      "required": true
    },
    {
      "name": "Tamanho do Mercado",
      "type": "text",
      "placeholder": "Ex: R$ 500M/ano no Brasil",
      "required": false
    },
    {
      "name": "Principais Competidores",
      "type": "textarea",
      "placeholder": "Liste os players principais no mercado",
      "required": false
    },
    {
      "name": "Diferencial",
      "type": "textarea",
      "placeholder": "O que torna esta oportunidade única?",
      "required": false
    }
  ],
  "suggestion": "Card para explorar e avaliar oportunidades de negócio, incluindo análise de mercado e competição."
}
```

## Research Category

### Example 1: Interview Notes

**Input**: "Track user interviews with questions asked and key insights"

**Output**:
```json
{
  "name": "Entrevista com Usuário",
  "fields": [
    {
      "name": "Nome do Entrevistado",
      "type": "text",
      "placeholder": "Ex: Maria S. (pode ser anonimizado)",
      "required": true
    },
    {
      "name": "Data da Entrevista",
      "type": "date",
      "required": true
    },
    {
      "name": "Perfil",
      "type": "text",
      "placeholder": "Ex: Designer, 30 anos, freelancer",
      "required": false
    },
    {
      "name": "Perguntas Realizadas",
      "type": "textarea",
      "placeholder": "Liste as principais perguntas feitas",
      "required": false
    },
    {
      "name": "Insights Principais",
      "type": "textarea",
      "placeholder": "Quais foram as descobertas mais importantes?",
      "required": true
    },
    {
      "name": "Citações Relevantes",
      "type": "textarea",
      "placeholder": "Frases marcantes do entrevistado",
      "required": false
    },
    {
      "name": "Gravação",
      "type": "file",
      "placeholder": "Link para gravação da entrevista",
      "required": false
    }
  ],
  "suggestion": "Card estruturado para documentar entrevistas qualitativas, capturando insights e citações valiosas para validação de hipóteses."
}
```

### Example 2: Competitive Analysis

**Input**: "Compare competitors with their features, pricing, and strengths/weaknesses"

**Output**:
```json
{
  "name": "Análise de Concorrente",
  "fields": [
    {
      "name": "Nome do Concorrente",
      "type": "text",
      "placeholder": "Ex: Empresa XYZ",
      "required": true
    },
    {
      "name": "Website",
      "type": "url",
      "placeholder": "https://...",
      "required": false
    },
    {
      "name": "Principais Features",
      "type": "textarea",
      "placeholder": "Liste as funcionalidades principais",
      "required": true
    },
    {
      "name": "Modelo de Precificação",
      "type": "text",
      "placeholder": "Ex: Freemium, R$ 99/mês",
      "required": false
    },
    {
      "name": "Pontos Fortes",
      "type": "textarea",
      "placeholder": "O que eles fazem muito bem?",
      "required": true
    },
    {
      "name": "Pontos Fracos",
      "type": "textarea",
      "placeholder": "Onde eles deixam a desejar?",
      "required": true
    },
    {
      "name": "Ameaça",
      "type": "select",
      "options": ["Alta", "Média", "Baixa"],
      "required": false
    }
  ],
  "suggestion": "Card para análise competitiva detalhada, identificando forças, fraquezas e posicionamento dos concorrentes no mercado."
}
```

## Planning Category

### Example 1: OKR (Objectives and Key Results)

**Input**: "Track OKRs with objectives, key results, and progress"

**Output**:
```json
{
  "name": "OKR - Objetivos e Resultados-Chave",
  "fields": [
    {
      "name": "Objetivo",
      "type": "text",
      "placeholder": "Ex: Aumentar engajamento dos usuários",
      "required": true
    },
    {
      "name": "Resultado-Chave 1",
      "type": "text",
      "placeholder": "Ex: 10.000 usuários ativos mensais",
      "required": true
    },
    {
      "name": "Resultado-Chave 2",
      "type": "text",
      "placeholder": "Ex: NPS acima de 50",
      "required": false
    },
    {
      "name": "Resultado-Chave 3",
      "type": "text",
      "placeholder": "Ex: Retenção de 60% no mês 2",
      "required": false
    },
    {
      "name": "Período",
      "type": "text",
      "placeholder": "Ex: Q1 2024",
      "required": true
    },
    {
      "name": "Progresso (%)",
      "type": "number",
      "placeholder": "Ex: 75",
      "required": false
    },
    {
      "name": "Status",
      "type": "select",
      "options": ["No prazo", "Em risco", "Atrasado", "Concluído"],
      "required": false
    }
  ],
  "suggestion": "Card para framework OKR, permitindo definir objetivos ambiciosos com resultados-chave mensuráveis e acompanhamento de progresso."
}
```

### Example 2: Dependency Mapping

**Input**: "Map project dependencies and blockers"

**Output**:
```json
{
  "name": "Dependência de Projeto",
  "fields": [
    {
      "name": "Nome da Dependência",
      "type": "text",
      "placeholder": "Ex: Integração com API de pagamento",
      "required": true
    },
    {
      "name": "Tipo",
      "type": "select",
      "options": ["Técnica", "Recurso", "Externa", "Aprovação"],
      "required": true
    },
    {
      "name": "Descrição",
      "type": "textarea",
      "placeholder": "Detalhe a dependência",
      "required": true
    },
    {
      "name": "Responsável",
      "type": "text",
      "placeholder": "Ex: Equipe de Backend",
      "required": false
    },
    {
      "name": "Prazo Estimado",
      "type": "date",
      "required": false
    },
    {
      "name": "Bloqueando",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Criticidade",
      "type": "select",
      "options": ["Crítica", "Alta", "Média", "Baixa"],
      "required": true
    }
  ],
  "suggestion": "Card para mapeamento de dependências críticas, ajudando a identificar e resolver bloqueadores no projeto."
}
```

## Design Category

### Example 1: Design Token

**Input**: "Document design tokens like colors, typography, and spacing"

**Output**:
```json
{
  "name": "Design Token",
  "fields": [
    {
      "name": "Nome do Token",
      "type": "text",
      "placeholder": "Ex: color-primary-500",
      "required": true
    },
    {
      "name": "Categoria",
      "type": "select",
      "options": ["Cor", "Tipografia", "Espaçamento", "Sombra", "Borda"],
      "required": true
    },
    {
      "name": "Valor",
      "type": "text",
      "placeholder": "Ex: #3B82F6, 16px, 1rem",
      "required": true
    },
    {
      "name": "Uso Recomendado",
      "type": "textarea",
      "placeholder": "Quando e onde usar este token?",
      "required": false
    },
    {
      "name": "Exemplo Visual",
      "type": "file",
      "placeholder": "Screenshot mostrando o token em uso",
      "required": false
    }
  ],
  "suggestion": "Card para documentar tokens de design, criando linguagem visual consistente e reutilizável no sistema de design."
}
```

### Example 2: Accessibility Checklist

**Input**: "Create accessibility checklist for features"

**Output**:
```json
{
  "name": "Checklist de Acessibilidade",
  "fields": [
    {
      "name": "Feature/Componente",
      "type": "text",
      "placeholder": "Ex: Formulário de Login",
      "required": true
    },
    {
      "name": "Navegação por Teclado",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Screen Reader Testado",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Contraste de Cores (WCAG AA)",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Labels ARIA",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Foco Visível",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Notas/Problemas Encontrados",
      "type": "textarea",
      "placeholder": "Descreva problemas ou melhorias necessárias",
      "required": false
    },
    {
      "name": "Conforme WCAG",
      "type": "select",
      "options": ["AA", "AAA", "Não conforme"],
      "required": false
    }
  ],
  "suggestion": "Checklist para garantir conformidade com padrões WCAG e criar experiências acessíveis para todos os usuários."
}
```

## Development Category

### Example 1: API Endpoint

**Input**: "Document API endpoints with method, path, parameters, and response"

**Output**:
```json
{
  "name": "Endpoint de API",
  "fields": [
    {
      "name": "Nome do Endpoint",
      "type": "text",
      "placeholder": "Ex: Get User Profile",
      "required": true
    },
    {
      "name": "Método HTTP",
      "type": "select",
      "options": ["GET", "POST", "PUT", "PATCH", "DELETE"],
      "required": true
    },
    {
      "name": "Path",
      "type": "text",
      "placeholder": "Ex: /api/v1/users/:id",
      "required": true
    },
    {
      "name": "Descrição",
      "type": "textarea",
      "placeholder": "O que este endpoint faz?",
      "required": true
    },
    {
      "name": "Parâmetros",
      "type": "textarea",
      "placeholder": "Liste parâmetros (query, path, body)",
      "required": false
    },
    {
      "name": "Resposta Exemplo",
      "type": "textarea",
      "placeholder": "JSON de resposta de exemplo",
      "required": false
    },
    {
      "name": "Autenticação Necessária",
      "type": "checkbox",
      "required": false
    },
    {
      "name": "Documentação",
      "type": "url",
      "placeholder": "Link para doc detalhada (Swagger, etc)",
      "required": false
    }
  ],
  "suggestion": "Card para documentar endpoints de API, facilitando comunicação entre backend e frontend e servindo como referência técnica."
}
```

### Example 2: Technical Debt

**Input**: "Track technical debt items with impact and effort to fix"

**Output**:
```json
{
  "name": "Dívida Técnica",
  "fields": [
    {
      "name": "Título",
      "type": "text",
      "placeholder": "Ex: Refatorar módulo de autenticação",
      "required": true
    },
    {
      "name": "Descrição do Problema",
      "type": "textarea",
      "placeholder": "Qual é a dívida técnica?",
      "required": true
    },
    {
      "name": "Impacto",
      "type": "select",
      "options": ["Crítico", "Alto", "Médio", "Baixo"],
      "required": true
    },
    {
      "name": "Esforço para Resolver",
      "type": "select",
      "options": ["Pequeno (1-2 dias)", "Médio (1 semana)", "Grande (1+ sprint)"],
      "required": true
    },
    {
      "name": "Consequências de Não Resolver",
      "type": "textarea",
      "placeholder": "O que acontece se ignorarmos isso?",
      "required": false
    },
    {
      "name": "Solução Proposta",
      "type": "textarea",
      "placeholder": "Como podemos resolver?",
      "required": false
    },
    {
      "name": "Área do Código",
      "type": "text",
      "placeholder": "Ex: /src/auth/*",
      "required": false
    }
  ],
  "suggestion": "Card para rastrear e priorizar dívidas técnicas, equilibrando desenvolvimento de features com manutenção de código."
}
```

## Marketing Category

### Example 1: Content Calendar

**Input**: "Plan content with title, type, channel, and publish date"

**Output**:
```json
{
  "name": "Planejamento de Conteúdo",
  "fields": [
    {
      "name": "Título do Conteúdo",
      "type": "text",
      "placeholder": "Ex: 10 Dicas de Produtividade",
      "required": true
    },
    {
      "name": "Tipo de Conteúdo",
      "type": "select",
      "options": ["Blog Post", "Vídeo", "Podcast", "Infográfico", "E-book"],
      "required": true
    },
    {
      "name": "Canal",
      "type": "select",
      "options": ["Blog", "Instagram", "LinkedIn", "YouTube", "Newsletter"],
      "required": true
    },
    {
      "name": "Data de Publicação",
      "type": "date",
      "required": true
    },
    {
      "name": "Objetivo",
      "type": "textarea",
      "placeholder": "O que queremos alcançar com este conteúdo?",
      "required": false
    },
    {
      "name": "Call-to-Action",
      "type": "text",
      "placeholder": "Ex: Baixar e-book, Agendar demo",
      "required": false
    },
    {
      "name": "Status",
      "type": "select",
      "options": ["Ideia", "Em produção", "Revisão", "Agendado", "Publicado"],
      "required": false
    },
    {
      "name": "Publicado",
      "type": "checkbox",
      "required": false
    }
  ],
  "suggestion": "Card para calendário editorial, organizando produção e publicação de conteúdo em múltiplos canais."
}
```

### Example 2: Campaign Performance

**Input**: "Track marketing campaigns with metrics like reach, conversions, and ROI"

**Output**:
```json
{
  "name": "Performance de Campanha",
  "fields": [
    {
      "name": "Nome da Campanha",
      "type": "text",
      "placeholder": "Ex: Lançamento Produto X",
      "required": true
    },
    {
      "name": "Canal",
      "type": "select",
      "options": ["Google Ads", "Facebook Ads", "Email", "Orgânico", "Influenciadores"],
      "required": true
    },
    {
      "name": "Período",
      "type": "text",
      "placeholder": "Ex: Jan-Mar 2024",
      "required": true
    },
    {
      "name": "Orçamento (R$)",
      "type": "number",
      "placeholder": "Ex: 5000",
      "required": false
    },
    {
      "name": "Impressões",
      "type": "number",
      "placeholder": "Número de visualizações",
      "required": false
    },
    {
      "name": "Cliques",
      "type": "number",
      "required": false
    },
    {
      "name": "Conversões",
      "type": "number",
      "required": false
    },
    {
      "name": "ROI (%)",
      "type": "number",
      "placeholder": "Retorno sobre investimento",
      "required": false
    },
    {
      "name": "Aprendizados",
      "type": "textarea",
      "placeholder": "O que funcionou? O que não funcionou?",
      "required": false
    }
  ],
  "suggestion": "Card para acompanhar métricas de campanhas de marketing, permitindo análise de performance e otimização de investimento."
}
```

## Advanced Patterns

### Multi-Select Pattern (Not Supported - Use Textarea Instead)

When users ask for multi-select or tags, guide them to use textarea:

**Wrong**:
```json
{
  "name": "Tags",
  "type": "multi-select",
  "options": ["..."]
}
```

**Right**:
```json
{
  "name": "Tags",
  "type": "textarea",
  "placeholder": "Digite as tags separadas por vírgula: design, frontend, urgente"
}
```

### Conditional Fields (Not Supported - Simplify)

When users describe conditional logic, create simpler alternatives:

**Request**: "Show 'Reason for Cancellation' only if Status is 'Cancelled'"

**Solution**: Create both fields, make optional:
```json
{
  "name": "Status",
  "type": "select",
  "options": ["Ativo", "Pausado", "Cancelado"],
  "required": true
},
{
  "name": "Motivo de Cancelamento",
  "type": "textarea",
  "placeholder": "Preencha apenas se o status for 'Cancelado'",
  "required": false
}
```

### File Uploads (Not Supported - Use URL)

Always use `file` type with URL input, not actual uploads:

```json
{
  "name": "Documento",
  "type": "file",
  "placeholder": "Cole a URL do documento (Google Drive, Dropbox, etc)",
  "required": false
}
```
