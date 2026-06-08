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
    if (year) match.year = Number(year)

    const documents = await Document.aggregate([
        { $match: match },
        {
            $project: {
                title: 1,
                type: 1,
                description: 1,
                fileUrl: 1,
                fileName: 1,
                year: 1,
                publishedAt: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
    ])

    const years = await Document.distinct("year", { status: "published" })
    years.sort((a, b) => b - a)

    return (
        <DocumentsDisplay
            documents={JSON.parse(JSON.stringify(documents))}
            years={years}
        />
    )
}
