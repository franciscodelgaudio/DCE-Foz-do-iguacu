import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/Display"
import { News } from "@/models/news" 

export const revalidate = 0 // dashboard sempre atualizado (sem cache)

function last7DaysSkeleton() {
    const now = new Date()
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (6 - i))
        const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
        return { date: key, published: 0 }
    })
    return days
}

async function getJournalStats() {

    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)

    // 1) Totais
    const totalsAgg = await News.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
                scheduled: { $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] } },
                views: { $sum: { $ifNull: ["$viewCount", 0] } }, // se não existir, soma 0
            },
        },
        { $project: { _id: 0 } },
    ])

    const totals =
        totalsAgg?.[0] ?? { total: 0, published: 0, draft: 0, scheduled: 0, views: 0 }

    // 2) Publicados por dia (últimos 7)
    const last7Agg = await News.aggregate([
        { $match: { status: "published", publishedAt: { $gte: start, $lte: now } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
                published: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", published: 1 } },
    ])

    const baseDays = last7DaysSkeleton()
    const map = new Map(last7Agg.map((x) => [x.date, x.published]))
    const last7Days = baseDays.map((d) => ({
        date: d.date,
        published: map.get(d.date) ?? 0,
    }))

    // 3) “Categorias” (na sua base: TAGS)
    // - se tags estiver vazio, não conta
    // - se quiser “Sem tag”, dá pra adicionar um pipeline extra, mas mantive simples
    const byCategoryAgg = await News.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: { $ne: null, $ne: "" } } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, category: "$_id", count: 1 } },
    ])

    // 4) Top posts (por viewCount, fallback por updatedAt)
    // - se viewCount não existir, fica 0 e o sort por updatedAt mantém “mais recentes”
    const topPostsRaw = await News.find(
        {},
        { title: 1, status: 1, viewCount: 1, updatedAt: 1 }
    )
        .sort({ viewCount: -1, updatedAt: -1 })
        .limit(5)
        .lean()

    const topPosts = topPostsRaw.map((p) => ({
        id: String(p._id),
        title: p.title ?? "(Sem título)",
        status: p.status ?? "draft",
        viewCount: p.viewCount ?? 0,
    }))

    return {
        totals,
        last7Days,
        byCategory: byCategoryAgg,
        topPosts,
    }
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const stats = await getJournalStats()

    const firstName =
        session.user?.name?.trim()?.split(" ")?.[0] ||
        session.user?.email?.split("@")?.[0] ||
        "Editor"

    return (
        <div className="p-6">
            <Display name={firstName} stats={stats} />
        </div>
    )
}
