import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Contact } from "@/models/contact"
import { Display } from "@/components/dashboard/contatos/Display"

export const metadata = {
    title: "Contatos",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const [messages, total, unread] = await Promise.all([
        Contact.find({}).sort({ createdAt: -1 }).lean(),
        Contact.countDocuments(),
        Contact.countDocuments({ status: "unread" }),
    ])

    return (
        <Display
            messages={JSON.parse(JSON.stringify(messages))}
            total={total}
            unread={unread}
            emailEnabled={Boolean(process.env.RESEND_API_KEY)}
        />
    )
}
