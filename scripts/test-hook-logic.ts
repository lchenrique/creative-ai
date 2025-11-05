import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_ANON_KEY || "" : ""

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Configure as variáveis de ambiente")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllFiles(prefix = ''): Promise<any[]> {
    console.log(`\n🔍 Listando prefix: '${prefix}'`)

    const { data, error } = await supabase.storage.from('cliparts').list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
        console.error(`❌ Erro ao listar '${prefix}':`, error)
        return []
    }

    if (!data || data.length === 0) {
        console.log(`📁 Pasta vazia: ${prefix || '/'}`)
        return []
    }

    console.log(`📁 ${prefix || '/'}: ${data.length} itens`)
    data.forEach((item, i) => {
        if (i < 5) {
            console.log(`   ${item.id ? '📄' : '📁'} ${item.name} ${item.id ? `(id: ${item.id})` : '(pasta)'}`)
        }
    })
    if (data.length > 5) {
        console.log(`   ... e mais ${data.length - 5} itens`)
    }

    let allFiles: any[] = []

    for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name

        // Se tem ID, é arquivo. Se não tem ID, é pasta
        if (item.id) {
            // É um arquivo
            allFiles.push({ ...item, fullPath })
        } else {
            // É uma pasta - buscar recursivamente
            console.log(`   ↳ Entrando na pasta: ${fullPath}`)
            const subFiles = await listAllFiles(fullPath)
            allFiles = allFiles.concat(subFiles)
        }
    }

    return allFiles
}

async function test() {
    console.log("🚀 Testando lógica do hook useSupabaseCliparts\n")

    const allFiles = await listAllFiles()

    console.log(`\n\n✅ Total de arquivos encontrados: ${allFiles.length}`)

    if (allFiles.length > 0) {
        console.log("\n📄 Primeiros 5 arquivos:")
        allFiles.slice(0, 5).forEach(file => {
            console.log(`   ${file.fullPath}`)
        })

        // Filtrar SVGs
        const svgFiles = allFiles.filter(f => f.name.endsWith('.svg'))
        console.log(`\n✅ Total de SVGs: ${svgFiles.length}`)

        // Categorias
        const categories = Array.from(new Set(svgFiles.map(f => f.fullPath.split('/')[0]))).sort()
        console.log(`\n📂 Categorias encontradas: ${categories.join(', ')}`)
    }
}

test().catch(console.error)
