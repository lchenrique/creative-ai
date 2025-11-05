# 🚀 Guia Rápido: Upload de Cliparts

## 📋 Passo a Passo

### 1️⃣ Configure o .env

Adicione a **Service Role Key** do Supabase no `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

Para obter a key:
1. Acesse seu projeto no Supabase
2. Vá em **Settings** → **API**
3. Copie a **service_role key** (secret)

### 2️⃣ Execute o Upload

```bash
pnpm upload-cliparts
```

Isso vai:
- ✅ Criar o bucket "cliparts" automaticamente
- ✅ Subir ~3000+ SVGs das pastas magicons e open_stickers
- ✅ Manter a estrutura de categorias
- ⏱️ Tempo estimado: 10-20 minutos

### 3️⃣ Verifique o Upload

```bash
pnpm list-cliparts
```

Isso mostra:
- 📁 Estrutura de pastas
- 📊 Total por categoria
- 🔗 Exemplos de URLs públicas

### 4️⃣ Use no Frontend

Abra o editor e clique em "Adicionar Clipart":

1. **Aba "Minhas Imagens"** → Acesso aos cliparts do Supabase
2. **Filtro de categoria** → magicons, open_stickers, etc.
3. **Busca** → Digite "cat", "arrow", "tree", etc.
4. **Clique** → Adiciona ao canvas!

## 📦 Estrutura Final

```
Supabase Storage → cliparts/
├── magicons/
│   ├── Animals/ (cat.svg, dog.svg, ...)
│   ├── Arrows/ (arrow-up.svg, ...)
│   ├── Business/ (briefcase.svg, ...)
│   └── ... (20+ categorias)
└── open_stickers/
    ├── IT/ (computer.svg, ...)
    ├── Life/ (heart.svg, ...)
    ├── Nature/ (tree.svg, ...)
    └── Shapes/ (circle.svg, ...)
```

## 🎯 Recursos

- **~3000+ cliparts** prontos para uso
- **Busca instantânea** por nome
- **Filtro por categoria**
- **SVGs otimizados** e escaláveis
- **URLs públicas** cacheadas pelo Supabase

## 🐛 Problemas Comuns

**Erro: "SUPABASE_SERVICE_ROLE_KEY not found"**
→ Adicione a key no `.env`

**Upload travou**
→ Normal! São milhares de arquivos. Aguarde.

**Bucket já existe**
→ Tudo bem! O script faz upsert (sobrescreve).

**Nenhum clipart aparece no frontend**
→ Verifique se o upload terminou com sucesso.
