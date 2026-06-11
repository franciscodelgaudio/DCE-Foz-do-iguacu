import { Job } from "@/models/job"
import { Display } from "@/components/home/vagas/Display"

export const metadata = {
    title: "Vagas — Junte-se a Nós",
    description: "Faça parte do DCE. Veja as vagas abertas e venha construir o futuro do movimento estudantil.",
}

export default async function Page() {
    const jobs = await Job.find({ status: "open" }).sort({ createdAt: -1 }).lean()

    return <Display jobs={JSON.parse(JSON.stringify(jobs))} />
}
