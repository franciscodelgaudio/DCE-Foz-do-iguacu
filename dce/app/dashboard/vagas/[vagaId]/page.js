import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { JobForm } from "@/components/dashboard/vagas/JobForm"
import { Job } from "@/models/job"
import mongoose from "mongoose"

export const metadata = {
    title: "Editar Vaga",
}

export default async function Page({ params }) {
    const session = await auth()
    if (!session) redirect("/login")

    const { vagaId } = await params

    if (!mongoose.Types.ObjectId.isValid(vagaId)) notFound()

    const job = await Job.findById(vagaId).lean()
    if (!job) notFound()

    return <JobForm jobItem={JSON.parse(JSON.stringify(job))} />
}
