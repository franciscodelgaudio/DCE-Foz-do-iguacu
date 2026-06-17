import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { News } from "@/models/news"
import { CALENDAR_SLOTS, COORDINATIONS, ROTATION, SLOT_REQUIRED } from "@/lib/editorial"
import { Display } from "@/components/dashboard/news/editorial/Display"

export const metadata = {
    title: "Controle Editorial",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    // Busca todas as matérias publicadas com coordination e publishedAt
    const published = await News.find(
        { status: "published", publishedAt: { $exists: true, $ne: null } },
        { coordination: 1, publishedAt: 1, _id: 0 }
    ).lean()

    // Calcula status de cada slot do calendário
    const slots = CALENDAR_SLOTS.map((slot, i) => {
        const start = new Date(slot.start + "T00:00:00")
        const end = new Date(slot.end + "T23:59:59")
        const matching = published.filter((n) => {
            const d = new Date(n.publishedAt)
            return d >= start && d <= end
        })
        const assignedKey = ROTATION[i % ROTATION.length]
        const assignedCoord = COORDINATIONS.find((c) => c.key === assignedKey)
        const assignedPublished = matching.some((n) => n.coordination === assignedKey)
        const filled = matching.length >= SLOT_REQUIRED && assignedPublished
        return {
            ...slot,
            count: matching.length,
            filled,
            assignedKey,
            assignedLabel: assignedCoord?.label ?? assignedKey,
            assignedPublished,
        }
    })

    // Calcula obrigações — apenas coordenações com meta > 0
    const coordStats = COORDINATIONS
        .filter((c) => c.goal > 0)
        .map((coord) => {
            const done = published.filter((n) => n.coordination === coord.key).length
            return { ...coord, done }
        })

    return (
        <Display
            slots={slots}
            coordStats={coordStats}
            today={new Date().toISOString()}
        />
    )
}
