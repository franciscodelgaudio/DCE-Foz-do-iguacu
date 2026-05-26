import { News } from "@/models/news"
import { Event } from "@/models/event"
import { Display } from "@/components/home/search/Display"

export function generateMetadata({ searchParams }) {
    const q = searchParams?.q?.trim()
    return { title: q ? `Resultados para "${q}"` : "Busca" }
}

export default async function Page({ searchParams }) {
    const { q } = await searchParams
    const query = q?.trim() ?? ""

    if (!query) {
        return <Display query="" news={[]} events={[]} />
    }

    const regex = { $regex: query, $options: "i" }
    const match = (extra = {}) => ({
        status: "published",
        $or: [{ title: regex }, { excerpt: regex }],
        ...extra,
    })

    const [news, events] = await Promise.all([
        News.aggregate([
            { $match: match() },
            { $sort: { publishedAt: -1 } },
            { $limit: 8 },
            { $project: { title: 1, excerpt: 1, publishedAt: 1, contentHtml: 1 } },
        ]),
        Event.aggregate([
            { $match: match() },
            { $sort: { eventDate: 1 } },
            { $limit: 8 },
            { $project: { title: 1, excerpt: 1, eventDate: 1, location: 1, contentHtml: 1 } },
        ]),
    ])

    return (
        <Display
            query={query}
            news={JSON.parse(JSON.stringify(news))}
            events={JSON.parse(JSON.stringify(events))}
        />
    )
}
