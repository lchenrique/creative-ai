# 📦 Scripts de Upload de Cliparts

Scripts para fazer upload de imagens SVG para o Supabase Storage.

## 🚀 Como Usar

### 1. Configurar variáveis de ambiente

Adicione ao arquivo `.env`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

⚠️ **IMPORTANTE**: A `SUPABASE_SERVICE_ROLE_KEY` tem permissões totais! Nunca faça commit dela ou exponha no frontend.

### 2. Fazer upload dos cliparts

```bash
pnpm upload-cliparts
```

Este script irá:
- ✅ Criar o bucket "cliparts" se não existir (público)
- ✅ Fazer upload de todos os SVGs das pastas:
  - `magicons/` → 2867 ícones flat
  - `open_stickers/` → Stickers diversos
- ✅ Manter a estrutura de pastas (categorias)
- ✅ Fazer upsert (sobrescreve se já existir)
- ✅ Mostrar progresso em tempo real

### 3. Listar todos os cliparts

```bash
pnpm list-cliparts
```

Este script irá:
- 📋 Listar recursivamente todos os arquivos
- 📊 Mostrar total por categoria
- 🔗 Exibir exemplos de URLs públicas

## 📁 Estrutura no Supabase

```
bucket: cliparts/
├── magicons/
│   ├── Animals/
│   │   ├── cat.svg
│   │   └── dog.svg
│   ├── Arrows/
│   ├── Business/
│   └── ...
└── open_stickers/
    ├── IT/
    ├── Life/
    ├── Nature/
    └── Shapes/
```

## 🎨 Usando no Frontend

### Hook: `useSupabaseCliparts`

```typescript
import { useSupabaseCliparts } from '@/hooks/useSupabaseCliparts'

function MyComponent() {
  const { images, loading, categories } = useSupabaseCliparts({
    search: 'cat',      // Busca opcional
    category: 'magicons' // Filtro de categoria opcional
  })

  return (
    <div>
      {/* Filtro por categoria */}
      <select>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Grid de imagens */}
      {images.map(img => (
        <img key={img.name} src={img.url} alt={img.name} />
      ))}
    </div>
  )
}
```

### Recursos do Hook

- ✅ Lista **recursivamente** todas as subpastas
- ✅ Busca por nome de arquivo
- ✅ Filtro por categoria
- ✅ Retorna categorias únicas
- ✅ URLs públicas prontas para uso

## 📊 Estatísticas Esperadas

Após o upload completo:

- **magicons**: ~2867 ícones SVG
- **open_stickers**: ~centenas de stickers
- **Total**: ~3000+ cliparts
- **Categorias**: 20+ categorias diferentes

## 🔧 Troubleshooting

### Erro: "Bucket não encontrado"
O script cria automaticamente, mas você pode criar manualmente no painel do Supabase:
1. Storage → Create Bucket
2. Nome: `cliparts`
3. Marcar como **Public**

### Erro: "Permission denied"
Verifique se a `SUPABASE_SERVICE_ROLE_KEY` está correta no `.env`

### Upload muito lento
O script faz upload sequencial. Para ~3000 arquivos, pode levar 10-20 minutos.
