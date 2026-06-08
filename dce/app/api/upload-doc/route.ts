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

    const originalName = file.name
    const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_')
    const ext = sanitized.match(/\.[^.]+$/)?.[0] ?? ''
    const baseName = sanitized.replace(/\.[^.]+$/, '').slice(0, 60)
    const uniqueSuffix = Date.now().toString(36)
    const publicId = `dce/documentos/${baseName}_${uniqueSuffix}${ext}`

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: publicId,
            },
            (error, result) => {
                if (error || !result) reject(error ?? new Error('Upload falhou'))
                else resolve(result as { secure_url: string })
            }
        ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url, fileName: originalName })
}
