import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DocumentForm } from "@/components/dashboard/documentos/DocumentForm"

export const metadata = {
    title: "Novo Documento",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const isAdmin = session.user?.role === "admin"

    return <DocumentForm isAdmin={isAdmin} />
}
