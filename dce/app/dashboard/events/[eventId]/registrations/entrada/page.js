import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Event } from "@/models/event"
import { EventRegistration } from "@/models/eventRegistration"
import { CheckInDisplay } from "@/components/dashboard/events/[eventId]/CheckInDisplay"

export async function generateMetadata({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).lean()
    return { title: `Entrada - ${event?.title ?? "Evento"}` }
}

export default async function Page({ params }) {
    const session = await auth()
    if (!session) redirect("/login")
    const isAdmin = session.user?.role === "admin"

    const { eventId } = await params
    const event = await Event.findById(eventId).lean()

    if (!event) redirect("/dashboard/events")

    const registrations = await EventRegistration.find({ eventId })
        .sort({ entryConfirmedAt: 1, createdAt: -1 })
        .lean()

    return (
        <CheckInDisplay
            registrations={JSON.parse(JSON.stringify(registrations))}
            event={JSON.parse(JSON.stringify(event))}
            isAdmin={isAdmin}
        />
    )
}
