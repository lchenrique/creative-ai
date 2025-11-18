import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.VITE_SUPABASE_URL ? process.env.VITE_SUPABASE_ANON_KEY || "" : ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllFiles(prefix = ''): Promise<any[]> {
    const { data, error } = await supabase.storage.from('cliparts').list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
        return []
    }

    if (!data || data.length === 0) {
        return []
    }
    data.forEach((item, i) => {
        if (i < 5) {
        }
    })
    if (data.length > 5) {
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
            const subFiles = await listAllFiles(fullPath)
            allFiles = allFiles.concat(subFiles)
        }
    }

    return allFiles
}

async function test() {
    const allFiles = await listAllFiles()
    if (allFiles.length > 0) {
        allFiles.slice(0, 5).forEach(file => {
        })

        // Filtrar SVGs
        const svgFiles = allFiles.filter(f => f.name.endsWith('.svg'))
        // Categorias
        const categories = Array.from(new Set(svgFiles.map(f => f.fullPath.split('/')[0]))).sort()
    }
}

test().catch(console.error)
