import { createClient } from "@supabase/supabase-js"
import "dotenv/config"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Configure as variáveis de ambiente")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function setupBucketPolicies() {
    console.log("🔧 Configurando políticas de acesso do bucket 'cliparts'...\n")

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

        console.log("📋 Configure as seguintes políticas no Supabase Dashboard:")
        console.log("   https://supabase.com/dashboard/project/sceqhfcyjtjfawexnbvd/storage/policies\n")

        console.log("🔓 POLÍTICA 1 - Permitir leitura pública:")
        console.log("   Nome: Public read access for cliparts")
        console.log("   Allowed operation: SELECT")
        console.log("   Policy definition: true")
        console.log("   Target roles: public (anon + authenticated)\n")

        console.log("📝 OU execute este SQL no SQL Editor do Supabase:\n")
        console.log(`CREATE POLICY "Public read access for cliparts"
ON storage.objects FOR SELECT
USING (bucket_id = 'cliparts');`)

        console.log("\n\n💡 Alternativamente, você pode usar a Service Role Key no frontend")
        console.log("   (não recomendado para produção, mas funciona para desenvolvimento)")

    } catch (error) {
        console.error("❌ Erro:", error)
    }
}

setupBucketPolicies().catch(console.error)
