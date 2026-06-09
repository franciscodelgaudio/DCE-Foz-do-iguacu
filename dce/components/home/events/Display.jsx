'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, CalendarDays, MapPin, UserPlus } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const now = new Date()

function formatEventDate(start, end) {
    if (!start) return null
    const s = new Date(start)
    const opts = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }
    const startStr = s.toLocaleDateString("pt-BR", opts)
    if (!end) return startStr
    const e = new Date(end)
    const sameDay = s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth() && s.getUTCDate() === e.getUTCDate()
    if (sameDay) {
        return `${startStr} – ${e.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}`
    }
    return `${startStr} – ${e.toLocaleDateString("pt-BR", opts)}`
}

function getFirstImageSrc(html) {
    if (!html) return null
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    return match?.[1] ?? null
}

export function Display({ events = [] }) {
    const router = useRouter()
    const params = useSearchParams()
    const activeTitle = params.get("title") ?? ""
    const [title, setTitle] = useState(activeTitle)

    useEffect(() => { setTitle(activeTitle) }, [activeTitle])

    function pushQuery(nextTitle) {
        const sp = new URLSearchParams(params.toString())
        const trimmed = (nextTitle ?? "").trim()
        if (trimmed) sp.set("title", trimmed)
        else sp.delete("title")
        const qs = sp.toString()
        router.push(qs ? `/home/events?${qs}` : "/home/events")
    }

    const upcoming = events.filter((e) => e.eventDate && new Date(e.eventDate) >= now)
    const past = events.filter((e) => !e.eventDate || new Date(e.eventDate) < now)

    return (
        <section className="w-full bg-[#f3f1ff]">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-12 md:px-10">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 border-b-4 border-[#2708ab] bg-[#fdf25a] px-4 py-2 shadow-[4px_4px_0_#2708ab]">
                            <CalendarDays className="h-4 w-4 text-[#2708ab]" />
                            <h2 className="text-lg font-extrabold text-[#2708ab]">Eventos</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Fique por dentro das atividades e eventos do DCE.
                        </p>
                    </div>

                    <form
                        className="w-full md:max-w-md"
                        onSubmit={(e) => { e.preventDefault(); pushQuery(title) }}
                    >
                        <div className="flex gap-2">
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título..."
                                    className="pl-9 bg-white"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="shrink-0 border-2 border-[#2708ab] bg-[#fdf25a] font-bold text-[#2708ab] hover:bg-[#fff86f]"
                            >
                                Buscar
                            </Button>
                        </div>
                        {activeTitle ? (
                            <div className="mt-2 flex items-center gap-2">
                                <Badge className="bg-[#fdf25a] text-[#2708ab] hover:bg-[#fff86f]">
                                    Filtro: {activeTitle}
                                </Badge>
                                <Button type="button" variant="ghost" className="h-7 px-2" onClick={() => pushQuery("")}>
                                    Limpar
                                </Button>
                            </div>
                        ) : null}
                    </form>
                </div>

                {/* Conteúdo */}
                <div className="mt-10 space-y-12">
                    {!events.length ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md bg-muted p-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                {activeTitle ? "Nenhum evento encontrado para esse termo." : "Ainda não há eventos publicados."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {upcoming.length > 0 && (
                                <div>
                                    <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#2708ab]">
                                        Próximos eventos
                                    </h3>
                                    <EventGrid events={upcoming} />
                                </div>
                            )}
                            {past.length > 0 && (
                                <div>
                                    <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        Eventos anteriores
                                    </h3>
                                    <EventGrid events={past} muted />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

function EventGrid({ events, muted = false }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {events.map((ev) => {
                const img = getFirstImageSrc(ev.contentHtml)
                const dateStr = formatEventDate(ev.eventDate, ev.eventEndDate)
                const reg = ev.registration
                const canRegister = !muted && reg?.enabled && (!reg.deadline || new Date(reg.deadline) > new Date())

                return (
                    <Card
                        key={String(ev._id)}
                        className={[
                            "group overflow-hidden pt-0 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl",
                            muted ? "opacity-70" : "",
                        ].join(" ")}
                    >
                        <Link href={`/home/events/${ev._id}`} className="block">
                            <div className="overflow-hidden">
                                {img ? (
                                    <div className="aspect-square w-full overflow-hidden">
                                        <img
                                            src={img}
                                            alt={ev.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-[200px] w-full items-center justify-center bg-[#e8e4ff]">
                                        <CalendarDays className="h-10 w-10 text-[#2708ab]/30" />
                                    </div>
                                )}
                            </div>

                            <CardHeader className="space-y-2 pt-4">
                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant="secondary" className="shrink-0">Evento</Badge>
                                    {!muted && <span className="text-xs font-medium text-emerald-600">Em breve</span>}
                                </div>

                                <CardTitle className="text-base leading-snug line-clamp-2">
                                    {ev.title}
                                </CardTitle>

                                {dateStr ? (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                        <span>{dateStr}</span>
                                    </div>
                                ) : null}

                                {ev.location ? (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="line-clamp-1">{ev.location}</span>
                                    </div>
                                ) : null}

                                {ev.excerpt ? (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{ev.excerpt.replace(/<[^>]*>/g, '').trim()}</p>
                                ) : null}
                            </CardHeader>
                        </Link>

                        {canRegister && (
                            <div className="px-4 pb-4">
                                <Link
                                    href={`/home/events/${ev._id}/inscricao`}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-[#2708ab] bg-[#fdf25a] px-3 py-2 text-sm font-bold text-[#2708ab] shadow-[2px_2px_0_#2708ab] transition-transform hover:-translate-y-0.5"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Inscrever-se
                                </Link>
                            </div>
                        )}
                    </Card>
                )
            })}
        </div>
    )
}
