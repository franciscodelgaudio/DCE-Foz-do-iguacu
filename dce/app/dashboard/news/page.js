import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "../../../components/dashboard/news/Display"
import { News } from "@/models/news"

export default async function Page() {
    const session = await auth()

    if (!session) { redirect("/login") }

    const news = await News.aggregate([
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
            }
        },
    ])

    return (
        <Display
            news={JSON.parse(JSON.stringify(news))}
        />
    )
}