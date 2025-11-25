import { createClient } from "@supabase/supabase-js"
import "dotenv/config"
import * as fs from "fs"
import * as path from "path"

const supabaseUrl = process.env.VITE_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// CONFIGURE AQUI: Ajuste o caminho para onde está a pasta open_stickers
const LOCAL_FOLDER = process.argv[2] || "D:/projetos/open_stickers"
const BUCKET_NAME = "cliparts"
const BUCKET_PREFIX = "open_stickers"

async function uploadFolder(localPath: string, remotePath: string = BUCKET_PREFIX) {
    const items = fs.readdirSync(localPath)

    for (const item of items) {
        const localItemPath = path.join(localPath, item)
        const remoteItemPath = `${remotePath}/${item}`
        const stats = fs.statSync(localItemPath)

        if (stats.isDirectory()) {
            await uploadFolder(localItemPath, remoteItemPath)
        } else if (item.endsWith(".svg") || item.endsWith(".png") || item.endsWith(".jpg") || item.endsWith(".jpeg")) {
            const fileBuffer = fs.readFileSync(localItemPath)

            // Determinar content type
            let contentType = "image/svg+xml"
            if (item.endsWith(".png")) contentType = "image/png"
            else if (item.endsWith(".jpg") || item.endsWith(".jpeg")) contentType = "image/jpeg"

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(remoteItemPath, fileBuffer, {
                    contentType,
                    upsert: true,
                })

            if (error) {
            } else {
            }
        }
    }
}

async function main() {


    if (!fs.existsSync(LOCAL_FOLDER)) {
        console.error("\n💡 Como usar:")
        console.error("   2. Execute: pnpm upload-open-stickers <caminho-da-pasta>")
        console.error("\n   OU edite o script e ajuste a variável LOCAL_FOLDER")
        process.exit(1)
    }

    try {
        await uploadFolder(LOCAL_FOLDER)

    } catch (error) {
        process.exit(1)
    }
}

main().catch(console.error)
