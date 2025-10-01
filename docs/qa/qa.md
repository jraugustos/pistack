# 🛡️ QA Assessment — PiStack (MVP)

## 1. Risk Profile (*risk*)

### Técnicos
- **Latência da IA**: chamadas ao GPT-5 podem ultrapassar 4s → impacto direto na UX.
- **Persistência Canvas**: autosave precisa ser confiável (<1s). Risco de perda de dados se debounce falhar.
- **Escalabilidade inicial**: até 200 cards por projeto pode pressionar React Flow.

### Segurança
- **Exposição de chaves OpenAI**: risco se chamadas forem feitas do cliente. Deve ser sempre server-side.
- **Auth Supabase**: falhas em RLS podem expor projetos.

### Negócio
- **Expectativa do usuário**: sem integrações no MVP → risco de frustração.
- **Templates pré-criados**: se confusos ou incompletos, minam percepção de valor.

📌 **Risco crítico**: IA lenta + perda de dados em autosave → devem ser priorizados no teste.

---

## 2. Test Design (*design*)

### Áreas Críticas (P0)
- **Autosave**: verificar gravação consistente em todas edições de card.
- **Chat do Card**: request → resposta → Apply → nova versão.
- **Export Markdown**: conteúdo completo e coerente.

### Test Levels
- **Unit Tests**:
  - Card model (criar, atualizar resumo, versionamento).
  - Edge model (conexões).
  - Export Markdown parser.
- **Integration Tests**:
  - Card CRUD ↔ DB Supabase.
  - Chat → resposta IA → salvar no DB.
  - Export → gerar arquivo válido com cards+edges.
- **E2E Tests**:
  1. Criar projeto → adicionar card → conectar → exportar.
  2. Criar projeto com template → aplicar chat → exportar.

### Priorização
- P0 (Must Have): Autosave, Chat Apply, Export.
- P1 (Should Have): Templates → cards iniciais criados corretamente.
- P2 (Nice to Have): UI estados (cores de status, toasts).

---

## 3. NFR Assessment (*nfr*)
- **Performance mínima**:
  - Autosave <1s percebido.
  - Chat: resposta inicial <4s (curta).
- **Segurança**:
  - OpenAI API key **não** exposta no cliente.
  - Projetos isolados por usuário (Supabase RLS).
- **Confiabilidade**:
  - Export não pode gerar arquivo vazio/incompleto.

---

## 4. Traceability (*trace*) — Sprint 1 Stories

### Story 1 — CRUD de Cards
- **Given** um usuário cria um card no canvas
- **When** ele salva ou edita título/resumo
- **Then** a alteração deve ser persistida no DB e refletida no UI.

### Story 2 — Conexões no Canvas
- **Given** dois cards existentes
- **When** o usuário conecta A → B
- **Then** a conexão deve aparecer visualmente e ser salva no DB.

### Story 3 — Chat Contextual (Apply)
- **Given** um card com chat aberto
- **When** o usuário envia prompt e aplica resposta
- **Then** o resumo do card deve ser atualizado e uma nova versão salva.

### Story 4 — Export Markdown
- **Given** um projeto com cards conectados
- **When** o usuário clica em Export
- **Then** deve baixar um `.md` com todos os cards e conexões.

---

## 5. Gate Rules
- **PASS**: P0 cobertos, sem falhas críticas.
- **CONCERNS**: P1/P2 falhos ou riscos mitigáveis.
- **FAIL**: P0 falho, segurança comprometida ou export inconsistente.
- **WAIVED**: issue aceita com justificativa formal.

---

## 6. Deliverables QA
Arquivos esperados no repositório:

```
docs/qa/assessments/
  mvp.autosave-risk-20250930.md
  mvp.chat-test-design-20250930.md
  mvp.export-trace-20250930.md

docs/qa/gates/
  mvp.autosave.yml
  mvp.chat.yml
  mvp.export.yml
```
