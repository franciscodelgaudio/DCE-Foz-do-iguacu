import { News } from "@/models/news";
import { Display } from "../../../components/home/news/Display";

export default async function Page({ searchParams }) {

    const { title } = await searchParams;

    const match = {
        status: 'published',
        ...(title ? { title: { $regex: title, $options: 'i' } } : {})
    }

    const news = await News.aggregate([
        { $match: match },
        {
            $project: {
                title: 1,
                excerpt: 1,
                contentHtml: 1,
                author: 1,
                publishedAt: 1,
            },
        }
    ]);

    return (
        <Display news={JSON.parse(JSON.stringify(news))} />
    )
}