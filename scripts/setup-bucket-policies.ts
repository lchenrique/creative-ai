import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setupBucketPolicies() {
    // Política para permitir leitura pública (SELECT)
    const selectPolicy = {
        name: "Public Access for Cliparts",
        definition: "true", // Permite acesso público
        action: "SELECT" as const,
        bucket_id: "cliparts"
    }

    try {
        // Nota: A API do Supabase Storage ainda não tem endpoint direto para policies via SDK
        // Você precisa configurar isso manualmente no painel do Supabase




        console.log(`CREATE POLICY "Public read access for cliparts"
ON storage.objects FOR SELECT
USING (bucket_id = 'cliparts');`)
        ")

    } catch (error) {
    }
}

setupBucketPolicies().catch(console.error)
