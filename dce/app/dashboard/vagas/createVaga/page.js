import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { JobForm } from "@/components/dashboard/vagas/JobForm"

export const metadata = {
    title: "Nova Vaga",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    return <JobForm />
}
