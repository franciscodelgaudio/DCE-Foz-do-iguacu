import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/events/createEvent/Display"

export const metadata = {
    title: "Novo Evento",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    return <Display />
}
