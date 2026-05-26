import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "../../../components/dashboard/news/Display"
import { News } from "@/models/news"

export const metadata = {
    title: "Gerenciar Jornal",
}

export default async function Page({ searchParams }) {
    const session = await auth()
    if (!session) redirect("/login")

    const sp = await searchParams
    const title = sp?.title ?? ""
    const status = sp?.status ?? ""
    const sortBy = sp?.sortBy ?? "publishedAt"
    const sortDir = sp?.sortDir ?? "desc"

    const match = {}
    if (title.trim()) match.title = { $regex: title.trim(), $options: "i" }
    if (status) match.status = status

    const SORT_FIELDS = ["title", "author.name", "publishedAt", "status"]
    const sortField = SORT_FIELDS.includes(sortBy) ? sortBy : "publishedAt"
    const sortOrder = sortDir === "asc" ? 1 : -1

    const news = await News.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        {
            $project: {
                title: 1,
                slug: 1,
                excerpt: 1,
                contentHtml: 1,
                contentJson: 1,
                contentText: 1,
                cover: 1,
                tags: 1,
                category: 1,
                status: 1,
                publishedAt: 1,
                scheduledAt: 1,
                author: 1,
                seo: 1,
                pinned: 1,
                viewCount: 1,
            },
        },
        { $sort: { [sortField]: sortOrder } },
    ])

    const total = await News.countDocuments()

    return (
        <Display
            news={JSON.parse(JSON.stringify(news))}
            total={total}
        />
    )
}
