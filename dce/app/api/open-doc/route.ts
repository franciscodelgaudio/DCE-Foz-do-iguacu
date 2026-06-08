import { NextRequest, NextResponse } from 'next/server'

function detectMimeType(filename: string): string {
    const lower = filename.toLowerCase()
    if (lower.endsWith('.pdf')) return 'application/pdf'
    if (lower.endsWith('.doc')) return 'application/msword'
    if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    return 'application/octet-stream'
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    const name = req.nextUrl.searchParams.get('name') || 'documento'
    const forceDownload = req.nextUrl.searchParams.get('download') === '1'

    if (!url || !url.startsWith('https://res.cloudinary.com/')) {
        return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    try {
        const upstream = await fetch(url)
        if (!upstream.ok) {
            return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
        }

        const upstreamType = upstream.headers.get('content-type') || ''
        const contentType = upstreamType && !upstreamType.includes('octet-stream')
            ? upstreamType
            : detectMimeType(name)

        const canViewInline = !forceDownload && (contentType.includes('pdf') || contentType.startsWith('image/'))
        const disposition = canViewInline
            ? `inline; filename="${name}"`
            : `attachment; filename="${name}"`

        const headers = new Headers({
            'Content-Type': contentType,
            'Content-Disposition': disposition,
            'Cache-Control': 'public, max-age=31536000, immutable',
        })

        const contentLength = upstream.headers.get('content-length')
        if (contentLength) headers.set('Content-Length', contentLength)

        return new NextResponse(upstream.body, { status: 200, headers })
    } catch {
        return NextResponse.json({ error: 'Erro ao carregar arquivo' }, { status: 500 })
    }
}
