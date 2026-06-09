import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/vagas/Display"
import { Job } from "@/models/job"

export const metadata = {
    title: "Vagas",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean()
    const total = await Job.countDocuments()

    return <Display jobs={JSON.parse(JSON.stringify(jobs))} total={total} />
}
