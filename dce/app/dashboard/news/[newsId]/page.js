import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { News } from "@/models/news"
import { Display } from "../../../../components/dashboard/news/[newsId]/Display";

export default async function Page({ params }) {

    const { newsId } = await params;
    const session = await auth()
    if (!session) { redirect("/login") }

    const newItem = await News.findById(newsId).lean();

    return (
        <Display
            newItem={JSON.parse(JSON.stringify(newItem))}
        />
    )
}