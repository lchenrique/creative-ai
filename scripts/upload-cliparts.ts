import { createClient } from "@supabase/supabase-js"
import "dotenv/config"
import fs from "fs/promises"
import path from "path"

// Variáveis de ambiente carregadas pelo dotenv/config
const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
if (!supabaseUrl || !supabaseKey) {
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
                    errorCount++
                } else {
                    uploadedCount++
                }
            } catch (error) {
                errorCount++
            }
        }
    }
}

async function createBucketIfNotExists() {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === bucketName)

    if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
        })

        if (error) {
            process.exit(1)
        }
    } else {
    }
}

async function main() {
    // Criar bucket se não existir
    await createBucketIfNotExists()

    // Upload de cada pasta
    for (const folder of folders) {

        try {
            await uploadDir(folder.path, folder.name)
        } catch (error) {
        }
    }


}

main().catch(console.error)
