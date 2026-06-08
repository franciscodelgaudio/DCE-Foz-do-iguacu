import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Document } from "@/models/document"
import { DocumentForm } from "@/components/dashboard/documentos/DocumentForm"
import { notFound } from "next/navigation"

export const metadata = {
    title: "Editar Documento",
}

export default async function Page({ params }) {
    const session = await auth()
    if (!session) redirect("/login")

    const { documentId } = await params
    const doc = await Document.findById(documentId).lean()
    if (!doc) notFound()

    return <DocumentForm document={JSON.parse(JSON.stringify(doc))} />
}
