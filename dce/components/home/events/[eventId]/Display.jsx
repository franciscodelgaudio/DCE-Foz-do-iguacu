import { CalendarDays, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

function formatEventDate(start, end) {
    if (!start) return null
    const tz = "America/Sao_Paulo"
    const s = new Date(start)
    const opts = { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: tz }
    const startStr = s.toLocaleDateString("pt-BR", opts)
    if (!end) return startStr
    const e = new Date(end)
    const sameDay = s.toLocaleDateString("pt-BR", { timeZone: tz }) === e.toLocaleDateString("pt-BR", { timeZone: tz })
    if (sameDay) {
        return `${startStr} – ${e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz })}`
    }
    return `${startStr} – ${e.toLocaleDateString("pt-BR", opts)}`
}

export function Display({ eventItem }) {
    const html = eventItem?.contentHtml

    if (!html) {
        return (
            <div className="rounded-md bg-muted p-6 text-sm text-muted-foreground">
                Este evento não possui descrição.
            </div>
        )
    }

    const dateStr = formatEventDate(eventItem.eventDate, eventItem.eventEndDate)
    const isUpcoming = eventItem.eventDate && new Date(eventItem.eventDate) >= new Date()

    const reg = eventItem.registration
    const registrationOpen =
        reg?.enabled &&
        (!reg.deadline || new Date(reg.deadline) > new Date())

    return (
        <div className="mx-auto w-full max-w-[850px] px-6 py-12 md:px-10">
            <header className="mb-8 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#2708ab]">
                    {isUpcoming ? "Próximo evento" : "Evento"}
                </div>

                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#2708ab] sm:text-5xl">
                    {eventItem.title}
                </h1>

                {eventItem.excerpt ? (
                    <div
                        className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg"
                        dangerouslySetInnerHTML={{ __html: eventItem.excerpt }}
                    />
                ) : null}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    {dateStr ? (
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-[#2708ab]" />
                            <span>{dateStr}</span>
                        </div>
                    ) : null}

                    {eventItem.location ? (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-[#2708ab]" />
                            <span>{eventItem.location}</span>
                        </div>
                    ) : null}
                </div>

                {eventItem.author?.name ? (
                    <p className="text-xs text-slate-400">Publicado por {eventItem.author.name}</p>
                ) : null}

                {registrationOpen && (
                    <Link
                        href={`/home/events/${eventItem._id}/inscricao`}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#2708ab] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#2708ab]/90 transition-colors"
                    >
                        Inscrever-se
                        <ArrowRight className="size-4" />
                    </Link>
                )}

                {reg?.enabled && reg.deadline && new Date(reg.deadline) <= new Date() && (
                    <p className="text-sm font-medium text-slate-500">Inscrições encerradas</p>
                )}

                <div className="h-0.5 w-20 bg-[#fdf25a]" />
            </header>

            <article
                className="prose prose-slate max-w-none prose-img:rounded-lg prose-img:shadow prose-a:underline prose-a:underline-offset-4"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}
