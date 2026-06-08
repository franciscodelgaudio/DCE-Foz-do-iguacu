import { Document } from "@/models/document"
import { DocumentsDisplay } from "@/components/home/documentos/Display"

export const metadata = {
    title: "Editais e Atas",
    description: "Editais e atas de reunião do DCE UNIOESTE",
}

export default async function Page({ searchParams }) {
    const sp = await searchParams
    const type = sp?.type ?? ""
    const year = sp?.year ?? ""

    const match = { status: "published" }
    if (type) match.type = type
    if (year) {
        const y = Number(year)
        match.date = { $gte: new Date(`${y}-01-01`), $lt: new Date(`${y + 1}-01-01`) }
    }

    const documents = await Document.aggregate([
        { $match: match },
        {
            $project: {
                title: 1,
                type: 1,
                description: 1,
                fileUrl: 1,
                fileName: 1,
                date: 1,
                publishedAt: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ])

    const yearsAgg = await Document.aggregate([
        { $match: { status: "published", date: { $exists: true, $ne: null } } },
        { $group: { _id: { $year: "$date" } } },
        { $sort: { _id: -1 } },
    ])
    const years = yearsAgg.map((y) => y._id)

    return (
        <DocumentsDisplay
            documents={JSON.parse(JSON.stringify(documents))}
            years={years}
        />
    )
}
