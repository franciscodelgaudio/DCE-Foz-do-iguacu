import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Document } from "@/models/document"
import { Display } from "@/components/dashboard/documentos/Display"

export const metadata = {
    title: "Editais e Atas",
}

export default async function Page({ searchParams }) {
    const session = await auth()
    if (!session) redirect("/login")

    const sp = await searchParams
    const title = sp?.title ?? ""
    const type = sp?.type ?? ""
    const status = sp?.status ?? ""
    const sortBy = sp?.sortBy ?? "createdAt"
    const sortDir = sp?.sortDir ?? "desc"

    const match = {}
    if (title.trim()) match.title = { $regex: title.trim(), $options: "i" }
    if (type) match.type = type
    if (status) match.status = status

    const SORT_FIELDS = ["title", "type", "date", "status", "createdAt", "publishedAt"]
    const sortField = SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt"
    const sortOrder = sortDir === "asc" ? 1 : -1

    const documents = await Document.aggregate([
        ...(Object.keys(match).length ? [{ $match: match }] : []),
        {
            $project: {
                title: 1,
                type: 1,
                description: 1,
                fileUrl: 1,
                fileName: 1,
                date: 1,
                status: 1,
                publishedAt: 1,
                author: 1,
                createdAt: 1,
            },
        },
        { $sort: { [sortField]: sortOrder } },
    ])

    const total = await Document.countDocuments()

    return (
        <Display
            documents={JSON.parse(JSON.stringify(documents))}
            total={total}
        />
    )
}
