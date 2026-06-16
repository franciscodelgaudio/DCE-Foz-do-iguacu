import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Event } from "@/models/event"
import { EventRegistration } from "@/models/eventRegistration"
import { RegistrationsDisplay } from "@/components/dashboard/events/[eventId]/RegistrationsDisplay"

export async function generateMetadata({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).lean()
    return { title: `Inscrições — ${event?.title ?? "Evento"}` }
}

export default async function Page({ params }) {
    const session = await auth()
    if (!session) redirect("/login")
    const isAdmin = session.user?.role === "admin"

    const { eventId } = await params
    const event = await Event.findById(eventId).lean()

    if (!event) redirect("/dashboard/events")

    const registrations = await EventRegistration.find({ eventId })
        .sort({ createdAt: -1 })
        .lean()

    return (
        <RegistrationsDisplay
            registrations={JSON.parse(JSON.stringify(registrations))}
            event={JSON.parse(JSON.stringify(event))}
            isAdmin={isAdmin}
        />
    )
}
