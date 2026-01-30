import { Display } from "../../components/home/Display"
import { News } from "@/models/news";

export default async function Page() {

    const news = await News.aggregate([
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
    ])

    return (
        <Display
            news={JSON.parse(JSON.stringify(news))}
        />
    )
}
