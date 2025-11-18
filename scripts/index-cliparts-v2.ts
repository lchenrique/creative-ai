import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Pastas para processar (adicione mais conforme necessário)
const FOLDERS_TO_INDEX = ["magicons", "open_stickers"]

// Função para gerar keywords a partir do nome do arquivo
function generateKeywords(filename: string, category: string, folderPath: string): string[] {
    // Remove TODAS as extensões comuns (svg, png, jpg, jpeg) e converte para lowercase
    const nameWithoutExt = filename
        .replace(/\.(svg|png|jpe?g)$/i, "")
        .toLowerCase()

    // Separa por underscore, hífen, espaço
    const words = nameWithoutExt
        .split(/[-_\s]+/)
        .filter((word) => word.length > 2) // Remove palavras muito curtas

    // Adiciona palavras da categoria
    const categoryWords = category.toLowerCase().split(/[-_\s]+/)

    // Adiciona palavras do caminho (subpastas)
    const pathWords = folderPath
        .toLowerCase()
        .split("/")
        .flatMap(part => part.split(/[-_\s]+/))
        .filter((word) => word.length > 2)

    // Remove duplicatas e retorna
    return Array.from(new Set([...words, ...categoryWords, ...pathWords]))
}

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
        // 1. Buscar todos os arquivos do Storage de todas as pastas
        let allSvgFiles: any[] = []

        for (const folder of FOLDERS_TO_INDEX) {
            const files = await listAllFiles(folder)
            const svgFiles = files.filter(f =>
                (f.name.endsWith('.svg') || f.name.endsWith('.png') || f.name.endsWith('.jpg') || f.name.endsWith('.jpeg')) &&
                !f.name.includes('.emptyFolderPlaceholder')
            )
            allSvgFiles = allSvgFiles.concat(svgFiles)
        }
        // 2. Limpar tabela existente
        const { error: deleteError } = await supabase
            .from('cliparts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos

        if (deleteError && deleteError.code !== 'PGRST116') {
        } else {
        }

        // 3. Inserir cliparts na tabela com keywords
        const clipartsData = allSvgFiles.map(file => {
            const { data } = supabase.storage.from('cliparts').getPublicUrl(file.fullPath)
            const pathParts = file.fullPath.split('/')
            const category = pathParts[0] // Primeira pasta (magicons, open_stickers, etc)
            const subcategory = pathParts.length > 2 ? pathParts.slice(1, -1).join('/') : ''

            // Gerar keywords
            const keywords = generateKeywords(file.name, category, subcategory)

            return {
                name: file.name,
                category: category,
                path: file.fullPath,
                url: data.publicUrl,
                keywords: keywords
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
                const progress = Math.round((insertedCount / clipartsData.length) * 100)
            }
        }
        console.log("🎉 Indexação completa!")
        console.log(`❌ Erros: ${errorCount}`)
        // 4. Mostrar estatísticas
        // Usar count por categoria para evitar limite de 1000
        const { data: magiconsCount } = await supabase
            .from('cliparts')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'magicons')

        const { data: openStickersCount } = await supabase
            .from('cliparts')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'open_stickers')
        console.log(`   open_stickers: ${openStickersCount || 0}`)

        // 5. Mostrar exemplo de keywords
        const { data: samples } = await supabase
            .from('cliparts')
            .select('name, category, keywords')
            .limit(5)

        if (samples) {
            samples.forEach((item: any) => {
                console.log(`      → ${item.keywords.join(', ')}`)
            })
        }

    } catch (error) {
        process.exit(1)
    }
}

indexCliparts().catch(console.error)
