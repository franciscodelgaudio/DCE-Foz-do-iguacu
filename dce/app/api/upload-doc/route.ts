import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
        return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string; original_filename: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'dce/documentos',
                resource_type: 'raw',
                use_filename: true,
                unique_filename: true,
            },
            (error, result) => {
                if (error || !result) reject(error ?? new Error('Upload falhou'))
                else resolve(result as { secure_url: string; original_filename: string })
            }
        ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url, fileName: file.name })
}
