# Configuração do Supabase

## Passo a Passo

### 1. Acessar o Supabase Dashboard
Acesse: https://supabase.com/dashboard

### 2. Selecionar seu Projeto
Escolha o projeto que você configurou no `.env.local`

### 3. Aplicar o Schema SQL

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `docs/supabase-schema.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)

### 4. Verificar se as Tabelas foram Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - `users`
   - `projects`
   - `stages`
   - `cards`
   - `ai_messages`
   - `ai_threads`

### 5. Verificar as RLS Policies

1. Clique em qualquer tabela no Table Editor
2. Clique na aba **RLS Policies**
3. Você deve ver políticas ativas para cada tabela

## O que o Schema Cria

- **6 tabelas** para armazenar todos os dados da aplicação
- **RLS (Row Level Security)** para proteger os dados de cada usuário
- **Trigger automático** que cria as 6 etapas quando um projeto é criado
- **Índices** para otimizar as queries

## Solução de Problemas

### Erro: "permission denied for schema public"
- Verifique se você está usando o projeto correto no Supabase
- Certifique-se de que tem permissões de admin no projeto

### Erro: "relation already exists"
- As tabelas já existem. Você pode:
  1. Deletar as tabelas existentes e rodar o schema novamente, OU
  2. Pular este passo se as tabelas já estão corretas

### Tabelas não aparecem
- Recarregue a página do Supabase
- Verifique se não houve erros na execução do SQL

## Após Aplicar o Schema

1. Recarregue a página `/projects` no navegador
2. O erro deve desaparecer
3. Você poderá criar projetos normalmente
