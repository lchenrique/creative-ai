import { createClient } from "@supabase/supabase-js"
import "dotenv/config"
import fs from "fs/promises"
import path from "path"

// Variáveis de ambiente carregadas pelo dotenv/config
const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

console.log("🔍 Verificando variáveis de ambiente:")
console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? "✅ Configurado" : "❌ Não encontrado"}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "✅ Configurado" : "❌ Não encontrado"}`)

if (!supabaseUrl || !supabaseKey) {
    console.error("\n❌ Erro: Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env")
    console.error("   Certifique-se de que o arquivo .env existe na raiz do projeto")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const bucketName = "cliparts"

// Pastas a serem enviadas
const folders = [
    {
        name: "magicons",
        path: "c:\\Users\\lchen\\Downloads\\test\\magicons\\Magicons - 2867 Flat Icons\\magicons\\SVG",
    },
    {
        name: "open_stickers",
        path: "c:\\Users\\lchen\\Downloads\\test\\open_stickers\\open_stickers\\SVG",
    },
]

let uploadedCount = 0
let errorCount = 0

async function uploadDir(localPath: string, remotePath = "") {
    const entries = await fs.readdir(localPath, { withFileTypes: true })

    for (const entry of entries) {
        const localFilePath = path.join(localPath, entry.name)
        const remoteFilePath = remotePath ? `${remotePath}/${entry.name}` : entry.name

        if (entry.isDirectory()) {
            // Recursivo para subpastas
            await uploadDir(localFilePath, remoteFilePath)
        } else if (entry.name.endsWith(".svg") || entry.name.endsWith(".png") || entry.name.endsWith(".jpg") || entry.name.endsWith(".jpeg")) {
            try {
                const fileBuffer = await fs.readFile(localFilePath)

                // Determinar content type
                let contentType = "image/svg+xml"
                if (entry.name.endsWith(".png")) contentType = "image/png"
                else if (entry.name.endsWith(".jpg") || entry.name.endsWith(".jpeg")) contentType = "image/jpeg"

                const { error } = await supabase.storage
                    .from(bucketName)
                    .upload(remoteFilePath, fileBuffer, {
                        contentType,
                        upsert: true,
                    })

                if (error) {
                    console.error(`❌ Erro ao enviar ${remoteFilePath}:`, error.message)
                    errorCount++
                } else {
                    console.log(`✅ Enviado: ${remoteFilePath}`)
                    uploadedCount++
                }
            } catch (error) {
                console.error(`❌ Erro ao ler arquivo ${localFilePath}:`, error)
                errorCount++
            }
        }
    }
}

async function createBucketIfNotExists() {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === bucketName)

    if (!bucketExists) {
        console.log(`📦 Criando bucket "${bucketName}"...`)
        const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        })

        if (error) {
            console.error("❌ Erro ao criar bucket:", error.message)
            process.exit(1)
        }
        console.log("✅ Bucket criado com sucesso!")
    } else {
        console.log(`✅ Bucket "${bucketName}" já existe`)
    }
}

async function main() {
    console.log("🚀 Iniciando upload de cliparts...\n")

    // Criar bucket se não existir
    await createBucketIfNotExists()

    // Upload de cada pasta
    for (const folder of folders) {
        console.log(`\n📁 Processando pasta: ${folder.name}`)
        console.log(`   Local: ${folder.path}`)
        console.log(`   Remoto: ${folder.name}/\n`)

        try {
            await uploadDir(folder.path, folder.name)
        } catch (error) {
            console.error(`❌ Erro ao processar ${folder.name}:`, error)
        }
    }

    console.log("\n" + "=".repeat(60))
    console.log("🎉 Upload completo!")
    console.log(`✅ Arquivos enviados: ${uploadedCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log("=".repeat(60))
}

main().catch(console.error)
