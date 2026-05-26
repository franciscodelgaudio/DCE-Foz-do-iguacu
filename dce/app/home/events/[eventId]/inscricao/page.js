import { notFound } from "next/navigation"
import { Event } from "@/models/event"
import { RegistrationForm } from "@/components/home/events/[eventId]/RegistrationForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export async function generateMetadata({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).lean()
    return { title: `Inscrição — ${event?.title ?? "Evento"}` }
}

export default async function Page({ params }) {
    const { eventId } = await params
    const event = await Event.findById(eventId).lean()

    if (!event || event.status !== "published") notFound()
    if (!event.registration?.enabled) notFound()

    return (
        <div className="min-h-screen bg-gray-50/40 px-4 py-8">
            <div className="mx-auto max-w-lg">
                <Link
                    href={`/home/events/${eventId}`}
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="size-4" />
                    Voltar ao evento
                </Link>
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <RegistrationForm event={JSON.parse(JSON.stringify(event))} />
                </div>
            </div>
        </div>
    )
}
