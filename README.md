# DCE • Portal & Jornal

Site do **DCE (Diretório Central dos Estudantes)** com área pública (páginas do DCE + Jornal) e área administrativa (Dashboard) para **criação, edição e publicação de notícias**.

> Stack: **Next.js (App Router)** + **Tailwind CSS** + **shadcn/ui** + **MongoDB** + **Auth**.

---

## ✨ Funcionalidades

### Público
- Página inicial do DCE
- Listagem e leitura de notícias
- Renderização do conteúdo do artigo (HTML gerado pelo editor)

### Dashboard (Protegido)
- Login e sessão de usuário
- Sidebar + navegação administrativa
- CRUD de notícias (rascunho / publicado / agendado)
- Editor rich-text com **TipTap**:
  - headings (H1/H2/H3), negrito/itálico/sublinhado/realce
  - listas (bullet e ordered)
  - links
  - imagens (upload)
  - alinhamento (inclui justificar)
  - tabelas

### Estatísticas do Jornal
- Total de artigos
- Quantidade por status (publicado / rascunho / agendado)
- Publicações dos últimos 7 dias
- Top artigos (por visualizações, se `viewCount` estiver habilitado)
- “Categorias” por tags (quando `category` não existir)

---

## 🧱 Tecnologias

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **shadcn/ui**
- **TipTap**
- **MongoDB + Mongoose**
- **Auth** (via `auth()` no server)

---

## 🚀 Rodando localmente

### 1) Clone o projeto
```bash
git clone <SEU_REPO.git>
cd <PASTA_DO_PROJETO>
```

### 2) Instale as dependências
```bash
npm install
```

### 3) Configure variáveis de ambiente
Crie um arquivo `.env.local` na raiz:

```bash
# Mongo
MONGODB_URI="mongodb+srv://..."

# Auth (exemplos - ajuste conforme seu setup)
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# URL do app
AUTH_URL="http://localhost:3000"
```

> Em produção, use `AUTH_URL="https://www.dceunioestefoz.org"` ou o domínio canônico configurado no Google OAuth.  
> Se tiver dúvidas, procure pelos usos em `@/auth`, `@/lib/db` e `@/lib/actions`.

### 4) Rode o projeto
```bash
npm run dev
```

Abra: `http://localhost:3000`

---

## 🗂️ Estrutura (resumo)

```txt
app/
  dashboard/                # Rotas protegidas (server components)
components/
  ui/                       # shadcn/ui
  dashboard/                # componentes do dashboard
lib/
  actions/                  # server actions (ex.: upsertNews)
  models/                   # mongoose models (News)
  db/                       # conexão com MongoDB (connectDB)
public/
  images/                   # logos e assets
```

---

## 📰 Modelo de Notícia (referência)

Campos usados no projeto (exemplo):

- `title` (string)
- `excerpt` (string)
- `contentHtml` (string) — HTML gerado pelo TipTap
- `contentJson` (mixed/json) — opcional
- `status` ("draft" | "published" | "scheduled")
- `publishedAt` (date)
- `createdAt` / `updatedAt` (date)
- `tags` (string[])
- `author` (object)
- `viewCount` (number) *(opcional — se implementado)*

---

## 📊 Dashboard de Estatísticas

O dashboard consome um payload no formato:

```ts
{
  totals: { total, published, draft, scheduled, views },
  last7Days: [{ date: "YYYY-MM-DD", published: number }],
  byCategory: [{ category: string, count: number }],
  topPosts: [{ id: string, title: string, status: string, viewCount: number }]
}
```

> Quando `category` não existe, o projeto usa `tags` como “categorias”.

---

## 🧠 Editor (TipTap)

- O conteúdo é salvo como HTML (`contentHtml`) e opcionalmente JSON (`contentJson`).
- Imagens podem ser inseridas via upload (slot custom).
- Alinhamento e justify funcionam via extensão `TextAlign`.

---

## ✅ Deploy

Recomendado: **Vercel**
- Configure as variáveis de ambiente no painel do projeto
- Garanta que o `MONGODB_URI` esteja correto
- Faça redeploy após alterar `.env`

---

## 📄 Licença

Este projeto é do DCE.  
Defina aqui a licença que você quiser (MIT, GPL, etc.).
