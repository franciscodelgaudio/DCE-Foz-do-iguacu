import { Display } from "../../components/home/Display"
import { News } from "@/models/news";
import { Event } from "@/models/event";
import { publishScheduled } from "@/lib/publishScheduled";

export const metadata = {
    title: "Home",
};

export default async function Page() {

    await publishScheduled()

    const now = new Date()

    const [news, events] = await Promise.all([
        News.aggregate([
            { $match: { status: 'published' } },
            { $sort: { publishedAt: -1, createdAt: -1 } },
            { $limit: 5 },
            {
                $project: {
                    title: 1,
                    excerpt: 1,
                    contentHtml: 1,
                    author: 1,
                    publishedAt: 1,
                },
            },
        ]),
        Event.aggregate([
            { $match: { status: 'published', eventDate: { $gte: now } } },
            { $sort: { eventDate: 1 } },
            { $limit: 4 },
            {
                $project: {
                    title: 1,
                    excerpt: 1,
                    location: 1,
                    eventDate: 1,
                    eventEndDate: 1,
                },
            },
        ]),
    ])

    return (
        <Display
            news={JSON.parse(JSON.stringify(news))}
            events={JSON.parse(JSON.stringify(events))}
        />
    )
}
