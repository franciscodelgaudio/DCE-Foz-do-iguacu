import { Display } from "../../components/home/Display"
import { News } from "@/models/news";
import { Event } from "@/models/event";
import { Job } from "@/models/job";
import { publishScheduled } from "@/lib/publishScheduled";

export const metadata = {
    title: "Home",
};

export default async function Page() {

    await publishScheduled()

    const now = new Date()

    const [news, events, jobs] = await Promise.all([
        News.aggregate([
            { $match: { status: 'published' } },
            { $sort: { featured: -1, publishedAt: -1, createdAt: -1 } },
            { $limit: 5 },
            {
                $project: {
                    title: 1,
                    excerpt: 1,
                    contentHtml: 1,
                    author: 1,
                    publishedAt: 1,
                    featured: 1,
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
                    registration: 1,
                },
            },
        ]),
        Job.find({ status: 'open' }).sort({ createdAt: -1 }).lean(),
    ])

    return (
        <Display
            news={JSON.parse(JSON.stringify(news))}
            events={JSON.parse(JSON.stringify(events))}
            jobs={JSON.parse(JSON.stringify(jobs))}
        />
    )
}
