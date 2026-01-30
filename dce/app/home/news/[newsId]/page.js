import { News } from "@/models/news";
import { Display } from "../../../../components/home/news/[newsId]/Display";

export default async function Page({ params }) {
    const { newsId } = await params;

    const newItem = await News.findById(newsId).select('title excerpt contentHtml author publishedAt');

    return (
        <Display newItem={JSON.parse(JSON.stringify(newItem))} />
    )
}