import { publishScheduled } from "@/lib/publishScheduled"

export async function GET(request) {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    const count = await publishScheduled()
    return Response.json({ published: count })
}
