import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

// Variáveis de ambiente carregadas pelo dotenv/config
const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const bucketName = "cliparts"

async function listAll(prefix = "", depth = 0): Promise<string[]> {
    const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
    })

    if (error) {
        return []
    }

    let files: string[] = []
    const indent = "  ".repeat(depth)

    for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name

        if (item.id) {
            // É um arquivo
            files.push(fullPath)
        } else {
            // É uma pasta
            const subFiles = await listAll(fullPath, depth + 1)
            files = files.concat(subFiles)
        }
    }

    return files
}

async function main() {
    const allFiles = await listAll()
    console.log(`📊 Total de arquivos: ${allFiles.length}`)
    // Agrupar por categoria
    const categories: Record<string, number> = {}
    allFiles.forEach((file) => {
        const category = file.split("/")[0]
        categories[category] = (categories[category] || 0) + 1
    })
    Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .forEach(([cat, count]) => {
        })

    // Exemplo de URLs públicas
    if (allFiles.length > 0) {
        allFiles.slice(0, 5).forEach((file) => {
            const { data } = supabase.storage.from(bucketName).getPublicUrl(file)
            console.log(`   → ${data.publicUrl}\n`)
        })
    }
}

main().catch(console.error)
