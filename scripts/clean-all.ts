import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Configure as variáveis de ambiente")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanAll() {
    console.log("🧹 Iniciando limpeza completa...\n")

    try {
        // 1. Limpar tabela cliparts
        console.log("🗑️  Limpando tabela cliparts...")
        const { error: deleteError } = await supabase
            .from('cliparts')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (deleteError && deleteError.code !== 'PGRST116') {
            console.error("❌ Erro ao limpar tabela:", deleteError)
        } else {
            console.log("✅ Tabela cliparts limpa")
        }

        // 2. Listar e deletar todos os arquivos do Storage
        console.log("\n🗑️  Limpando bucket de storage...")

        const folders = ['magicons', 'open_stickers']

        for (const folder of folders) {
            console.log(`   📁 Deletando pasta: ${folder}`)

            // Listar todos os arquivos
            const { data: files, error: listError } = await supabase.storage
                .from('cliparts')
                .list(folder, {
                    limit: 10000,
                })

            if (listError) {
                console.error(`   ❌ Erro ao listar ${folder}:`, listError.message)
                continue
            }

            if (!files || files.length === 0) {
                console.log(`   ℹ️  Pasta ${folder} vazia ou não encontrada`)
                continue
            }

            // Deletar arquivos em lotes
            const filePaths = files.map(f => `${folder}/${f.name}`)

            const { error: removeError } = await supabase.storage
                .from('cliparts')
                .remove(filePaths)

            if (removeError) {
                console.error(`   ❌ Erro ao deletar ${folder}:`, removeError.message)
            } else {
                console.log(`   ✅ Deletados ${filePaths.length} itens de ${folder}`)
            }
        }

        console.log("\n" + "=".repeat(60))
        console.log("✅ Limpeza completa!")
        console.log("=".repeat(60))
        console.log("\n📝 Próximos passos:")
        console.log("   1. Execute o SQL para recriar a tabela (scripts/create-cliparts-table.sql)")
        console.log("   2. Faça upload dos cliparts: pnpm upload-cliparts <caminho>")
        console.log("   3. Indexe no banco: pnpm index-cliparts-v2")

    } catch (error) {
        console.error("❌ Erro durante limpeza:", error)
        process.exit(1)
    }
}

cleanAll().catch(console.error)
