import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanAll() {
    try {
        // 1. Limpar tabela cliparts
        const { error: deleteError } = await supabase
            .from('cliparts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (deleteError && deleteError.code !== 'PGRST116') {
        } else {
        }

        // 2. Listar e deletar todos os arquivos do Storage
        const folders = ['magicons', 'open_stickers']

        for (const folder of folders) {
            // Listar todos os arquivos
            const { data: files, error: listError } = await supabase.storage
                .from('cliparts')
                .list(folder, {
                    limit: 10000,
                })

            if (listError) {
                continue
            }

            if (!files || files.length === 0) {
                continue
            }

            // Deletar arquivos em lotes
            const filePaths = files.map(f => `${folder}/${f.name}`)

            const { error: removeError } = await supabase.storage
                .from('cliparts')
                .remove(filePaths)

            if (removeError) {
            } else {
            }
        }
        console.log("✅ Limpeza completa!")
        console.log("\n📝 Próximos passos:")
        console.log("   2. Faça upload dos cliparts: pnpm upload-cliparts <caminho>")
    } catch (error) {
        process.exit(1)
    }
}

cleanAll().catch(console.error)
