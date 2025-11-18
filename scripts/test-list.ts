import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testList() {
    // Listar raiz
    const { data: root, error: rootError } = await supabase.storage
        .from('cliparts')
        .list('', { limit: 10 })
    if (rootError) {
    } else if (!root || root.length === 0) {
        console.log("\n💡 Execute: pnpm upload-cliparts")
    } else {
        root.forEach(item => {
            const type = item.id ? "📄 Arquivo" : "📁 Pasta"
        })
    }

    // Testar listar dentro de uma pasta específica
    const { data: magicons, error: magiconsError } = await supabase.storage
        .from('cliparts')
        .list('magicons', { limit: 10 })

    if (magiconsError) {
    } else if (!magicons || magicons.length === 0) {
    } else {
        magicons.slice(0, 5).forEach(item => {
            const type = item.id ? "📄 Arquivo" : "📁 Pasta"
        })
        if (magicons.length > 5) {
        }
    }

    // Verificar bucket existe
    const { data: buckets } = await supabase.storage.listBuckets()
    if (buckets) {
        buckets.forEach(bucket => {
        })
    }
}

testList().catch(console.error)
