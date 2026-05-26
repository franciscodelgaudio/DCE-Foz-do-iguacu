import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/events/Display"
import { Event } from "@/models/event"

export const metadata = {
    title: "Gerenciar Eventos",
}

export default async function Page({ searchParams }) {
    const session = await auth()
    if (!session) redirect("/login")

    const sp = await searchParams
    const title = sp?.title ?? ""
    const status = sp?.status ?? ""
    const sortBy = sp?.sortBy ?? "eventDate"
    const sortDir = sp?.sortDir ?? "desc"

    const match = {}
    if (title.trim()) match.title = { $regex: title.trim(), $options: "i" }
    if (status) match.status = status

    const SORT_FIELDS = ["title", "location", "eventDate", "author.name", "status"]
    const sortField = SORT_FIELDS.includes(sortBy) ? sortBy : "eventDate"
    const sortOrder = sortDir === "asc" ? 1 : -1

    const events = await Event.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        {
            $project: {
                title: 1,
                location: 1,
                eventDate: 1,
                eventEndDate: 1,
                status: 1,
                publishedAt: 1,
                author: 1,
                viewCount: 1,
            },
        },
        { $sort: { [sortField]: sortOrder } },
    ])

    const total = await Event.countDocuments()

    return <Display events={JSON.parse(JSON.stringify(events))} total={total} />
}
