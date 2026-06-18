import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { InscricaoCargo } from "@/models/inscricaoCargo"
import { Display } from "@/components/dashboard/inscricaoCargo/Display"

export const metadata = {
    title: "Inscrições de Cargo",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const [inscricoes, total, pending] = await Promise.all([
        InscricaoCargo.find({}).sort({ createdAt: -1 }).lean(),
        InscricaoCargo.countDocuments(),
        InscricaoCargo.countDocuments({ status: "pendente" }),
    ])

    return (
        <Display
            inscricoes={JSON.parse(JSON.stringify(inscricoes))}
            total={total}
            pending={pending}
        />
    )
}
