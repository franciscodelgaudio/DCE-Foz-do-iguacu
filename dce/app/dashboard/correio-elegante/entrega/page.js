import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DeliveryDisplay } from "@/components/dashboard/correio-elegante/DeliveryDisplay"
import { CorreioElegante } from "@/models/correioElegante"

export const metadata = {
    title: "Correio Elegante — Entregas",
}

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const orders = await CorreioElegante.find({ paymentStatus: "confirmed" })
        .sort({ createdAt: -1 })
        .lean()

    const stats = {
        total: orders.length,
        not_ready: orders.filter((o) => !o.deliveryStatus || o.deliveryStatus === "not_ready").length,
        ready: orders.filter((o) => o.deliveryStatus === "ready").length,
        delivered: orders.filter((o) => o.deliveryStatus === "delivered").length,
    }

    return (
        <DeliveryDisplay
            orders={JSON.parse(JSON.stringify(orders))}
            stats={stats}
        />
    )
}
