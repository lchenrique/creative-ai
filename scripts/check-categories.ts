import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
    // Contar total
    const { count: totalCount } = await (supabase as any)
        .from('cliparts')
        .select('*', { count: 'exact', head: true })
    // Contar magicons
    const { count: magiconsCount } = await (supabase as any)
        .from('cliparts')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'magicons')

    // Contar open_stickers
    const { count: openStickersCount } = await (supabase as any)
        .from('cliparts')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'open_stickers')


    const { data: openStickers } = await (supabase as any)
        .from('cliparts')
        .select('name, path, category')
        .eq('category', 'open_stickers')
        .limit(10)

    if (openStickers) {
        openStickers.forEach((item: any) => {
        })
    }
    const { data: magicons } = await (supabase as any)
        .from('cliparts')
        .select('name, path, category')
        .eq('category', 'magicons')
        .limit(5)

    if (magicons) {
        magicons.forEach((item: any) => {
        })
    }
}

checkCategories().catch(console.error)
