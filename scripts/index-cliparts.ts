import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Configure as variáveis de ambiente")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAllFiles(prefix = ''): Promise<any[]> {
    const { data, error } = await supabase.storage.from('cliparts').list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
        console.error(`❌ Erro ao listar '${prefix}':`, error)
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
    console.log("🚀 Iniciando indexação de cliparts...\n")

    try {
        // 1. Buscar todos os arquivos do Storage
        console.log("📁 Listando arquivos do Storage...")
        const allFiles = await listAllFiles()

        const svgFiles = allFiles.filter(f =>
            f.name.endsWith('.svg') && !f.name.includes('.emptyFolderPlaceholder')
        )

        console.log(`✅ Encontrados ${svgFiles.length} arquivos SVG\n`)

        // 2. Limpar tabela existente
        console.log("🗑️  Limpando tabela cliparts...")
        const { error: deleteError } = await supabase
            .from('cliparts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos

        if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = nenhum registro encontrado
            console.error("❌ Erro ao limpar tabela:", deleteError)
        } else {
            console.log("✅ Tabela limpa\n")
        }

        // 3. Inserir cliparts na tabela
        console.log("💾 Inserindo cliparts na tabela...")

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
                console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, insertError.message)
                errorCount += batch.length
            } else {
                insertedCount += batch.length
                console.log(`✅ Lote ${Math.floor(i / batchSize) + 1}: ${batch.length} cliparts inseridos`)
            }
        }

        console.log("\n" + "=".repeat(60))
        console.log("🎉 Indexação completa!")
        console.log(`✅ Cliparts indexados: ${insertedCount}`)
        console.log(`❌ Erros: ${errorCount}`)
        console.log("=".repeat(60))

        // 4. Mostrar estatísticas
        console.log("\n📊 Estatísticas por categoria:")
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
                    console.log(`   ${category}: ${count}`)
                })
        }

    } catch (error) {
        console.error("❌ Erro durante indexação:", error)
        process.exit(1)
    }
}

indexCliparts().catch(console.error)
