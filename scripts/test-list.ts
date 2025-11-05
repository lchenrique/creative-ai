import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Configure as variáveis de ambiente")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testList() {
    console.log("🔍 Testando listagem do bucket 'cliparts'...\n")

    // Listar raiz
    const { data: root, error: rootError } = await supabase.storage
        .from('cliparts')
        .list('', { limit: 10 })

    console.log("📁 Raiz do bucket:")
    if (rootError) {
        console.error("❌ Erro:", rootError)
    } else if (!root || root.length === 0) {
        console.log("   ⚠️  Vazio! Nenhum arquivo/pasta encontrado")
        console.log("\n💡 Execute: pnpm upload-cliparts")
    } else {
        console.log(`   ✅ ${root.length} itens encontrados:\n`)
        root.forEach(item => {
            const type = item.id ? "📄 Arquivo" : "📁 Pasta"
            console.log(`   ${type}: ${item.name}`)
        })
    }

    // Testar listar dentro de uma pasta específica
    console.log("\n\n📁 Testando pasta 'magicons':")
    const { data: magicons, error: magiconsError } = await supabase.storage
        .from('cliparts')
        .list('magicons', { limit: 10 })

    if (magiconsError) {
        console.error("❌ Erro:", magiconsError)
    } else if (!magicons || magicons.length === 0) {
        console.log("   ⚠️  Pasta vazia ou não existe")
    } else {
        console.log(`   ✅ ${magicons.length} itens encontrados:\n`)
        magicons.slice(0, 5).forEach(item => {
            const type = item.id ? "📄 Arquivo" : "📁 Pasta"
            console.log(`   ${type}: ${item.name}`)
        })
        if (magicons.length > 5) {
            console.log(`   ... e mais ${magicons.length - 5} itens`)
        }
    }

    // Verificar bucket existe
    console.log("\n\n🪣 Verificando buckets disponíveis:")
    const { data: buckets } = await supabase.storage.listBuckets()
    if (buckets) {
        buckets.forEach(bucket => {
            console.log(`   ${bucket.public ? '🔓' : '🔒'} ${bucket.name}`)
        })
    }
}

testList().catch(console.error)
