import { Event } from "@/models/event"
import { Display } from "@/components/home/events/Display"

export const metadata = {
    title: "Eventos",
}

export default async function Page({ searchParams }) {
    const { title } = await searchParams

    const match = {
        status: "published",
        ...(title ? { title: { $regex: title, $options: "i" } } : {}),
    }

    const events = await Event.aggregate([
        { $match: match },
        {
            $project: {
                title: 1,
                excerpt: 1,
                location: 1,
                eventDate: 1,
                eventEndDate: 1,
                contentHtml: 1,
                publishedAt: 1,
                registration: 1,
            },
        },
        { $sort: { eventDate: 1 } },
    ])

    return <Display events={JSON.parse(JSON.stringify(events))} />
}
