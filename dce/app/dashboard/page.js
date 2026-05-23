import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/Display"
import { News } from "@/models/news"
import { Event } from "@/models/event"

export const metadata = { title: "Dashboard" }
export const revalidate = 0

function last7DaysSkeleton() {
    const now = new Date()
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (6 - i))
        return { date: d.toISOString().slice(0, 10), published: 0 }
    })
}

async function getJournalStats() {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)

    const [totalsAgg, last7Agg, topPostsRaw, recentRaw] = await Promise.all([
        News.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
                    draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
                    scheduled: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
                    views: { $sum: { $ifNull: ["$viewCount", 0] } },
                },
            },
            { $project: { _id: 0 } },
        ]),
        News.aggregate([
            { $match: { status: "published", publishedAt: { $gte: start, $lte: now } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
                    published: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", published: 1 } },
        ]),
        News.find({}, { title: 1, status: 1, viewCount: 1 })
            .sort({ viewCount: -1, updatedAt: -1 })
            .limit(5)
            .lean(),
        News.find({}, { title: 1, status: 1, updatedAt: 1 })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean(),
    ])

    const totals = totalsAgg?.[0] ?? { total: 0, published: 0, draft: 0, scheduled: 0, views: 0 }

    const map = new Map(last7Agg.map((x) => [x.date, x.published]))
    const last7Days = last7DaysSkeleton().map((d) => ({
        date: d.date,
        published: map.get(d.date) ?? 0,
    }))

    const topPosts = topPostsRaw.map((p) => ({
        id: String(p._id),
        title: p.title ?? "(Sem título)",
        status: p.status ?? "draft",
        viewCount: p.viewCount ?? 0,
    }))

    const recentArticles = recentRaw.map((p) => ({
        id: String(p._id),
        title: p.title ?? "(Sem título)",
        status: p.status ?? "draft",
        updatedAt: p.updatedAt?.toISOString() ?? null,
    }))

    return { totals, last7Days, topPosts, recentArticles }
}

async function getEventStats() {
    const now = new Date()

    const [upcomingRaw, totalEvents] = await Promise.all([
        Event.find(
            { status: "published", eventDate: { $gte: now } },
            { title: 1, eventDate: 1, location: 1 }
        )
            .sort({ eventDate: 1 })
            .limit(5)
            .lean(),
        Event.countDocuments(),
    ])

    return {
        totalEvents,
        upcoming: upcomingRaw.map((e) => ({
            id: String(e._id),
            title: e.title ?? "(Sem título)",
            eventDate: e.eventDate?.toISOString() ?? null,
            location: e.location ?? null,
        })),
    }
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const [stats, eventStats] = await Promise.all([
        getJournalStats(),
        getEventStats(),
    ])

    const firstName =
        session.user?.name?.trim()?.split(" ")?.[0] ||
        session.user?.email?.split("@")?.[0] ||
        "Editor"

    return (
        <div className="p-6">
            <Display name={firstName} stats={stats} eventStats={eventStats} />
        </div>
    )
}
