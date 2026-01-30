import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "../../../../components/dashboard/news/createNews/Display"

export default async function Page() {
    const session = await auth()
    if (!session) { redirect("/login") }

    return (
        <Display />
    )
}