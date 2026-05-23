import Link from "next/link"
import { Newspaper, ArrowRight } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

function getFirstImageSrc(html) {
    if (!html) return null
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    return match?.[1] ?? null
}

function formatDate(date) {
    if (!date) return ""
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date))
}

export function NewsSession({ news = [] }) {
    if (!news.length) {
        return (
            <section className="w-full bg-[#f3f1ff]">
                <div className="mx-auto max-w-[1500px] px-6 py-16 md:px-10">
                    <Masthead />
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#2708ab]/20 bg-white py-16 text-center">
                        <Newspaper className="h-10 w-10 text-[#2708ab]/30" />
                        <p className="font-bold text-slate-600">Em breve o jornal acadêmico.</p>
                        <p className="text-sm text-slate-400">Novidades chegando em breve.</p>
                    </div>
                </div>
            </section>
        )
    }

    const [lead, ...rest] = news

    const leadCover = getFirstImageSrc(lead.contentHtml)

    return (
        <section className="w-full bg-[#f3f1ff]">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-14 md:px-10">

                <Masthead />

                {/* ── MOBILE / TABLET: scroll horizontal ── */}
                <div className="mt-8 lg:hidden">
                    <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch]">
                        {news.map((n) => {
                            const cover = getFirstImageSrc(n.contentHtml)
                            return (
                                <Link
                                    key={String(n._id)}
                                    href={`/home/news/${n._id}`}
                                    className="snap-start shrink-0 w-[260px] sm:w-[300px] group"
                                >
                                    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                                        {cover ? (
                                            <AspectRatio ratio={3 / 2} className="overflow-hidden">
                                                <img
                                                    src={cover}
                                                    alt={n.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </AspectRatio>
                                        ) : (
                                            <div className="h-40 w-full bg-zinc-100" />
                                        )}
                                        <div className="p-4">
                                            {n.publishedAt && (
                                                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#2708ab]">
                                                    {formatDate(n.publishedAt)}
                                                </p>
                                            )}
                                            <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-3 group-hover:text-[#2708ab] transition-colors">
                                                {n.title}
                                            </h3>
                                            {n.excerpt && (
                                                <div
                                                    className="mt-2 text-xs text-slate-500 line-clamp-2 [&>p]:m-0"
                                                    dangerouslySetInnerHTML={{ __html: n.excerpt }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Arraste para ver mais →</p>
                </div>

                {/* ── DESKTOP: layout jornal ── */}
                <div className="mt-8 hidden lg:grid lg:grid-cols-5 lg:gap-0">

                    {/* Matéria principal */}
                    <Link
                        href={`/home/news/${lead._id}`}
                        className="group col-span-3 border-r-2 border-[#2708ab]/20 pr-8"
                    >
                        {leadCover ? (
                            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                                <img
                                    src={leadCover}
                                    alt={lead.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </AspectRatio>
                        ) : (
                            <div className="h-64 w-full rounded-lg bg-zinc-200" />
                        )}

                        <div className="mt-5">
                            <span className="inline-block border-b-2 border-[#2708ab] pb-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2708ab]">
                                Destaque
                            </span>
                            <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900 transition-colors group-hover:text-[#2708ab]">
                                {lead.title}
                            </h3>
                            {lead.excerpt && (
                                <div
                                    className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3 [&>p]:m-0"
                                    dangerouslySetInnerHTML={{ __html: lead.excerpt }}
                                />
                            )}
                            {lead.publishedAt && (
                                <p className="mt-3 text-xs text-slate-400">{formatDate(lead.publishedAt)}</p>
                            )}
                            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2708ab] underline-offset-2 group-hover:underline">
                                Ler matéria completa <ArrowRight className="h-3 w-3" />
                            </span>
                        </div>
                    </Link>

                    {/* Matérias secundárias */}
                    <div className="col-span-2 flex flex-col divide-y divide-zinc-200 pl-8">
                        {rest.map((n) => {
                            const cover = getFirstImageSrc(n.contentHtml)
                            return (
                                <Link
                                    key={String(n._id)}
                                    href={`/home/news/${n._id}`}
                                    className="group flex gap-4 py-5 first:pt-0 last:pb-0"
                                >
                                    {cover ? (
                                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md">
                                            <img
                                                src={cover}
                                                alt={n.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-20 shrink-0 rounded-md bg-zinc-200" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        {n.publishedAt && (
                                            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-[#2708ab]">
                                                {formatDate(n.publishedAt)}
                                            </p>
                                        )}
                                        <h4 className="text-sm font-extrabold leading-snug text-slate-900 line-clamp-2 transition-colors group-hover:text-[#2708ab]">
                                            {n.title}
                                        </h4>
                                        {n.excerpt && (
                                            <div
                                                className="mt-1 text-xs text-slate-500 line-clamp-1 [&>p]:m-0"
                                                dangerouslySetInnerHTML={{ __html: n.excerpt }}
                                            />
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-[#2708ab]/20" />
                    <Link
                        href="/home/news"
                        className="inline-flex items-center gap-2 rounded-md border-2 border-[#2708ab] bg-[#fdf25a] px-5 py-2.5 text-sm font-bold text-[#2708ab] shadow-[3px_3px_0_#2708ab] transition-transform hover:-translate-y-0.5"
                    >
                        <Newspaper className="h-4 w-4" />
                        Ver todas as notícias
                    </Link>
                    <div className="h-px flex-1 bg-[#2708ab]/20" />
                </div>

            </div>
        </section>
    )
}

function Masthead() {
    const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())
    return (
        <div className="border-y-2 border-[#2708ab] py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Jornal Acadêmico</p>
            <h2 className="text-3xl font-black tracking-tight text-[#2708ab] uppercase md:text-4xl">
                DCE em Notícias
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-400 capitalize">{today} · UNIOESTE Foz do Iguaçu</p>
        </div>
    )
}
