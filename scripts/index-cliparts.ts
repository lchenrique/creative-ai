import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

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

    let allFiles: any[] = []

    for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name

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

async function indexCliparts() {
    try {
        // 1. Buscar todos os arquivos do Storage
        const allFiles = await listAllFiles()

        const svgFiles = allFiles.filter(f =>
            f.name.endsWith('.svg') && !f.name.includes('.emptyFolderPlaceholder')
        )
        // 2. Limpar tabela existente
        const { error: deleteError } = await supabase
            .from('cliparts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos

        if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = nenhum registro encontrado
        } else {
        }

        // 3. Inserir cliparts na tabela
        const clipartsData = svgFiles.map(file => {
            const { data } = supabase.storage.from('cliparts').getPublicUrl(file.fullPath)
            const category = file.fullPath.split('/')[0]

            return {
                name: file.name,
                category: category,
                path: file.fullPath,
                url: data.publicUrl
            }
        })

        // Inserir em lotes de 100
        const batchSize = 100
        let insertedCount = 0
        let errorCount = 0

        for (let i = 0; i < clipartsData.length; i += batchSize) {
            const batch = clipartsData.slice(i, i + batchSize)

            const { error: insertError } = await supabase
                .from('cliparts')
                .insert(batch)

            if (insertError) {
                errorCount += batch.length
            } else {
                insertedCount += batch.length
            }
        }


        // 4. Mostrar estatísticas
        const { data: stats } = await supabase
            .from('cliparts')
            .select('category')

        if (stats) {
            const categoryCounts = stats.reduce((acc: any, item: any) => {
                acc[item.category] = (acc[item.category] || 0) + 1
                return acc
            }, {})

            Object.entries(categoryCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .forEach(([category, count]) => {
                })
        }

    } catch (error) {
        process.exit(1)
    }
}

indexCliparts().catch(console.error)
