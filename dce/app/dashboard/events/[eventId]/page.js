import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Display } from "@/components/dashboard/events/[eventId]/Display"
import { Event } from "@/models/event"
import { EventRegistration } from "@/models/eventRegistration"

export async function generateMetadata({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).lean()
    return { title: event?.title ?? "Editar Evento" }
}

export default async function Page({ params }) {
    const session = await auth()
    if (!session) redirect("/login")

    const { eventId } = await params
    const event = await Event.findById(eventId).lean()

    if (!event) redirect("/dashboard/events")

    const registrationCount = await EventRegistration.countDocuments({ eventId })

    const isAdmin = session.user?.role === "admin"

    return (
        <Display
            eventItem={JSON.parse(JSON.stringify(event))}
            registrationCount={registrationCount}
            isAdmin={isAdmin}
        />
    )
}
