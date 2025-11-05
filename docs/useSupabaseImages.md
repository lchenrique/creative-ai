# useSupabaseImages Hook

Hook React para listar e buscar imagens armazenadas no Supabase Storage.

## 📦 Instalação

O hook já está integrado ao projeto e usa o client do Supabase configurado em `@/lib/supabase`.

## 🚀 Uso Básico

```typescript
import { useSupabaseImages } from '@/hooks/useSupabaseImages'

function MyComponent() {
  const { images, loading, error, hasMore } = useSupabaseImages({
    page: 1,
    pageSize: 30,
    search: ''
  })

  if (loading) return <p>Carregando...</p>
  if (error) return <p>Erro: {error}</p>

  return (
    <div>
      {images.map((image) => (
        <img key={image.name} src={image.url} alt={image.name} />
      ))}
    </div>
  )
}
```

## 📋 API

### Parâmetros

```typescript
interface UseSupabaseImagesProps {
  page?: number        // Página atual (padrão: 1)
  pageSize?: number    // Itens por página (padrão: 30)
  search?: string      // Filtro de busca por nome (padrão: '')
}
```

### Retorno

```typescript
interface UseSupabaseImagesReturn {
  images: SupabaseImage[]  // Array de imagens
  loading: boolean         // Estado de carregamento
  error: string | null     // Mensagem de erro (se houver)
  hasMore: boolean         // Se há mais páginas
  total: number           // Total de imagens na página atual
}

interface SupabaseImage {
  name: string        // Nome do arquivo
  url: string         // URL pública da imagem
  created_at: string  // Data de criação (ISO string)
}
```

## 🎯 Exemplos de Uso

### 1. Listagem Simples

```typescript
const { images, loading } = useSupabaseImages()
```

### 2. Com Paginação

```typescript
const [page, setPage] = useState(1)
const { images, hasMore } = useSupabaseImages({ page, pageSize: 20 })

<button onClick={() => setPage(p => p + 1)} disabled={!hasMore}>
  Próxima Página
</button>
```

### 3. Com Busca

```typescript
const [search, setSearch] = useState('')
const { images } = useSupabaseImages({ search })

<input 
  value={search} 
  onChange={(e) => setSearch(e.target.value)} 
  placeholder="Buscar..."
/>
```

### 4. Integrado com clipart-browser

```typescript
const [supabasePage, setSupabasePage] = useState(1)
const [supabaseSearch, setSupabaseSearch] = useState('')

const supabaseImages = useSupabaseImages({ 
  page: supabasePage, 
  pageSize: 30, 
  search: supabaseSearch 
})

// Renderiza grid de imagens com paginação
```

## 🔧 Configuração do Supabase Storage

### 1. Criar Bucket

No painel do Supabase:
1. Vá em **Storage**
2. Crie um bucket chamado **`images`**
3. Marque como **público** para URLs públicas

### 2. Políticas de Acesso (RLS)

Para permitir leitura pública:

```sql
-- Política para leitura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Política para upload autenticado (opcional)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

### 3. Upload de Imagens

Via painel do Supabase ou via código:

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .upload('minha-imagem.jpg', file)
```

## 🎨 Recursos

- ✅ Paginação automática
- ✅ Busca local por nome de arquivo
- ✅ URLs públicas geradas automaticamente
- ✅ Ordenação por data de criação (mais recentes primeiro)
- ✅ Filtra arquivos placeholder automáticos
- ✅ TypeScript completo
- ✅ Tratamento de erros

## 📝 Notas

- O bucket deve se chamar **`images`** (configurável no código)
- As imagens devem estar na raiz do bucket (não em subpastas)
- A busca é case-insensitive
- URLs são geradas no formato: `https://{project}.supabase.co/storage/v1/object/public/images/{filename}`

## 🐛 Troubleshooting

### Erro: "Bucket não encontrado"
- Verifique se o bucket `images` existe no Supabase Storage

### Erro: "Permissão negada"
- Verifique as políticas RLS do bucket
- Certifique-se que o bucket está marcado como público

### Imagens não aparecem
- Verifique se há arquivos no bucket
- Confirme que o `.env` tem as credenciais corretas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
