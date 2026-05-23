'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Newspaper, CalendarDays, MapPin, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function formatDate(value) {
    if (!value) return null
    return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function highlight(text, query) {
    if (!text || !query) return text
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const parts = text.split(new RegExp(`(${escaped})`, "gi"))
    return parts.map((part, i) =>
        new RegExp(`^${escaped}$`, "i").test(part)
            ? <mark key={i} className="bg-[#fdf25a] text-[#2708ab] rounded-sm px-0.5 not-italic font-semibold">{part}</mark>
            : part
    )
}

function stripHtml(html) {
    if (!html) return ""
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function NewsCard({ item, query }) {
    const excerpt = item.excerpt ? stripHtml(item.excerpt) : stripHtml(item.contentHtml)?.slice(0, 160)
    return (
        <Link
            href={`/home/news/${item._id}`}
            className="group flex items-start gap-4 rounded-lg border bg-white px-5 py-4 transition-all hover:border-[#2708ab] hover:shadow-[3px_3px_0_#2708ab]"
        >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f3f1ff] text-[#2708ab]">
                <Newspaper className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">Jornal</Badge>
                    {item.publishedAt && (
                        <span className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</span>
                    )}
                </div>
                <p className="font-semibold text-sm leading-snug text-slate-800 line-clamp-2">
                    {highlight(item.title, query)}
                </p>
                {excerpt && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {highlight(excerpt, query)}
                    </p>
                )}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2708ab] mt-1" />
        </Link>
    )
}

function EventCard({ item, query }) {
    const excerpt = item.excerpt || stripHtml(item.contentHtml)?.slice(0, 160)
    const date = formatDate(item.eventDate)
    return (
        <Link
            href={`/home/events/${item._id}`}
            className="group flex items-start gap-4 rounded-lg border bg-white px-5 py-4 transition-all hover:border-[#2708ab] hover:shadow-[3px_3px_0_#2708ab]"
        >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f3f1ff] text-[#2708ab]">
                <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">Evento</Badge>
                    {date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />{date}
                        </span>
                    )}
                    {item.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{item.location}
                        </span>
                    )}
                </div>
                <p className="font-semibold text-sm leading-snug text-slate-800 line-clamp-2">
                    {highlight(item.title, query)}
                </p>
                {excerpt && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {highlight(excerpt, query)}
                    </p>
                )}
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2708ab] mt-1" />
        </Link>
    )
}

function ResultSection({ title, count, children }) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#2708ab]">{title}</h2>
                <span className="rounded-full bg-[#f3f1ff] px-2 py-0.5 text-xs font-semibold text-[#2708ab]">{count}</span>
            </div>
            <div className="flex flex-col gap-2">{children}</div>
        </div>
    )
}

export function Display({ query: initialQuery, news = [], events = [] }) {
    const router = useRouter()
    const params = useSearchParams()
    const activeQuery = params.get("q") ?? ""
    const [q, setQ] = useState(activeQuery)

    useEffect(() => { setQ(activeQuery) }, [activeQuery])

    function handleSubmit(e) {
        e.preventDefault()
        const trimmed = q.trim()
        if (trimmed) router.push(`/home/search?q=${encodeURIComponent(trimmed)}`)
    }

    const total = news.length + events.length
    const hasResults = total > 0
    const hasQuery = !!initialQuery

    return (
        <section className="w-full bg-[#f3f1ff] min-h-[60vh]">
            <div className="mx-auto w-full max-w-3xl px-6 py-12 md:px-10">

                {/* Search bar */}
                <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            placeholder="Buscar no site..."
                            className="pl-9 bg-white h-11 text-base"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="h-11 px-5 border-2 border-[#2708ab] bg-[#fdf25a] font-bold text-[#2708ab] hover:bg-[#fff86f] shadow-[3px_3px_0_#2708ab]"
                    >
                        Buscar
                    </Button>
                </form>

                {/* Estado: sem query */}
                {!hasQuery && (
                    <p className="text-center text-sm text-muted-foreground py-16">
                        Digite algo para buscar em notícias e eventos.
                    </p>
                )}

                {/* Estado: sem resultados */}
                {hasQuery && !hasResults && (
                    <div className="rounded-xl border bg-white px-8 py-14 text-center">
                        <p className="text-slate-500 text-sm">
                            Nenhum resultado encontrado para <strong>"{initialQuery}"</strong>.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Tente palavras diferentes ou mais curtas.</p>
                    </div>
                )}

                {/* Resultados */}
                {hasQuery && hasResults && (
                    <div className="space-y-8">
                        <p className="text-sm text-muted-foreground">
                            <strong>{total}</strong> resultado{total !== 1 ? "s" : ""} para{" "}
                            <strong className="text-slate-700">"{initialQuery}"</strong>
                        </p>

                        {news.length > 0 && (
                            <ResultSection title="Jornal" count={news.length}>
                                {news.map((item) => (
                                    <NewsCard key={item._id} item={item} query={initialQuery} />
                                ))}
                            </ResultSection>
                        )}

                        {events.length > 0 && (
                            <ResultSection title="Eventos" count={events.length}>
                                {events.map((item) => (
                                    <EventCard key={item._id} item={item} query={initialQuery} />
                                ))}
                            </ResultSection>
                        )}
                    </div>
                )}

            </div>
        </section>
    )
}
