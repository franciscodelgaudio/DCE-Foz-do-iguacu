import Link from "next/link"
import { CalendarDays, MapPin, ArrowRight, Clock, UserPlus } from "lucide-react"

const TZ = "America/Sao_Paulo"

function formatDay(date) {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", timeZone: TZ }).format(date)
}
function formatMonth(date) {
    return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: TZ }).format(date).replace(".", "").toUpperCase()
}
function formatTime(date) {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(date)
}

export function EventsSession({ events = [] }) {
    const hasEvents = events.length > 0

    return (
        <section className="w-full border-t-[5px] border-[#2708ab] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">

                <div className="mb-7 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-[#2708ab]">Próximos Eventos</h2>
                            <p className="text-xs text-slate-500">Atividades e encontros do DCE</p>
                        </div>
                    </div>
                    <Link
                        href="/home/events"
                        className="hidden items-center gap-1.5 text-sm font-bold text-[#2708ab] underline-offset-2 hover:underline sm:inline-flex"
                    >
                        Ver todos
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {!hasEvents ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-14 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                            <CalendarDays className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">Em breve, novos eventos!</p>
                            <p className="mt-1 max-w-xs text-sm text-slate-500">
                                Fique ligado — em breve anunciaremos as próximas atividades do DCE.
                            </p>
                        </div>
                        <Link
                            href="/home/events"
                            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#2708ab] bg-[#fdf25a] px-4 py-2 text-sm font-bold text-[#2708ab] shadow-[3px_3px_0_#2708ab] transition-transform hover:-translate-y-0.5"
                        >
                            Ver calendário de eventos
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {events.map((event) => {
                            const date = event.eventDate ? new Date(event.eventDate) : null
                            const reg = event.registration
                            const canRegister = reg?.enabled && (!reg.deadline || new Date(reg.deadline) > new Date())
                            return (
                                <div
                                    key={String(event._id)}
                                    className="group flex flex-col rounded-xl border-2 border-transparent bg-[#f3f1ff] p-5 transition-all duration-200 hover:border-[#2708ab] hover:bg-white hover:shadow-[4px_4px_0_#2708ab]"
                                >
                                    <Link href={`/home/events/${event._id}`} className="flex flex-col">
                                        {date && (
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex min-w-[44px] flex-col items-center justify-center rounded-lg bg-[#2708ab] px-2.5 py-1.5">
                                                    <span className="text-xl font-extrabold leading-none text-[#fdf25a]">
                                                        {formatDay(date)}
                                                    </span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-200">
                                                        {formatMonth(date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(date)}
                                                </div>
                                            </div>
                                        )}

                                        <h3 className="line-clamp-2 font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#2708ab]">
                                            {event.title}
                                        </h3>

                                        {event.location && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                <span className="line-clamp-1">{event.location}</span>
                                            </div>
                                        )}
                                    </Link>

                                    <div className="mt-auto pt-4 flex items-center gap-2">
                                        {canRegister ? (
                                            <>
                                                <Link
                                                    href={`/home/events/${event._id}/inscricao`}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-[#2708ab] bg-[#fdf25a] px-3 py-1.5 text-xs font-bold text-[#2708ab] shadow-[2px_2px_0_#2708ab] transition-transform hover:-translate-y-0.5"
                                                >
                                                    <UserPlus className="h-3.5 w-3.5" />
                                                    Inscrever-se
                                                </Link>
                                                <Link
                                                    href={`/home/events/${event._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2708ab] underline-offset-2 hover:underline"
                                                >
                                                    Ver
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </>
                                        ) : (
                                            <Link
                                                href={`/home/events/${event._id}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#2708ab] underline-offset-2 group-hover:underline"
                                            >
                                                Ver evento
                                                <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-5 text-center sm:hidden">
                    <Link
                        href="/home/events"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2708ab] underline-offset-2 hover:underline"
                    >
                        Ver todos os eventos
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

            </div>
        </section>
    )
}
