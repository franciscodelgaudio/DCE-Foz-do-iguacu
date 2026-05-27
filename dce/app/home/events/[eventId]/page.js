import { Event } from "@/models/event"
import { Display } from "@/components/home/events/[eventId]/Display"
import { ViewTracker } from "@/components/home/events/[eventId]/ViewTracker"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).select("title excerpt").lean()
    if (!event) return {}
    return {
        title: event.title,
        description: event.excerpt,
    }
}

export default async function Page({ params }) {
    const { eventId } = await params

    const event = await Event.findOne({ _id: eventId, status: "published" })
        .select("title excerpt location eventDate eventEndDate contentHtml author publishedAt registration")
        .lean()

    if (!event) notFound()

    return (
        <>
            <ViewTracker eventId={String(event._id)} />
            <Display eventItem={JSON.parse(JSON.stringify(event))} />
        </>
    )
}
