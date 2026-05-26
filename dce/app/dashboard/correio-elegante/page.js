import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/correio-elegante/Display"
import { CorreioElegante } from "@/models/correioElegante"
import { getSettings } from "@/lib/actions/settings"

export const metadata = {
    title: "Correio Elegante — Dashboard",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const [orders, settings] = await Promise.all([
        CorreioElegante.find().sort({ createdAt: -1 }).lean(),
        getSettings(),
    ])

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.paymentStatus === "pending").length,
        confirmed: orders.filter((o) => o.paymentStatus === "confirmed").length,
        cancelled: orders.filter((o) => o.paymentStatus === "cancelled").length,
    }

    return (
        <Display
            orders={JSON.parse(JSON.stringify(orders))}
            stats={stats}
            settings={settings}
        />
    )
}
