import Link from "next/link"
import { Construction, Newspaper, Plus } from "lucide-react"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"

function getFirstImageSrc(html) {
    if (!html) return null
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    return match?.[1] ?? null
}

export function NewsSession({ news = [] }) {
    if (!news.length) {
        return (
            <section className="w-full">
                <div className="flex h-48 items-center justify-center gap-3 bg-muted rounded-md">
                    <Construction className="h-10 w-10 text-muted-foreground" />
                    <span className="text-muted-foreground">Em breve o jornal acadêmico.</span>
                </div>
            </section>
        )
    }

    return (
        <section className="w-full bg-gray-200">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-16 md:px-10">
                <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2">
                    <Newspaper className="h-4 w-4 text-white" />
                    <h2 className="text-lg font-extrabold text-white">Nosso Jornal</h2>
                </div>

                {/* =========================
            MOBILE/TABLET: scroll horizontal (arrastar)
            ========================= */}
                <div className="mt-10 lg:hidden">
                    <div
                        className="
              flex gap-6 overflow-x-auto pb-3
              snap-x snap-mandatory scroll-smooth
              [-webkit-overflow-scrolling:touch]
            "
                    >
                        {news.map((n) => {
                            const cover = getFirstImageSrc(n.contentHtml)
                            return (
                                <Card
                                    key={String(n._id)}
                                    className="
                    snap-start shrink-0 overflow-hidden pt-0
                    w-[260px] sm:w-[300px]
                    transition-all duration-300 ease-out
                    hover:-translate-y-2 hover:shadow-xl
                  "
                                >
                                    <Link href={`/home/news/${n._id}`}>
                                        {cover ? (
                                            <AspectRatio ratio={3 / 2.5} className="w-full overflow-hidden">
                                                <img
                                                    src={cover}
                                                    alt={n.title}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            </AspectRatio>
                                        ) : (
                                            <div className="h-[200px] sm:h-[240px] w-full bg-muted" />
                                        )}

                                        <CardHeader className="space-y-3">
                                            <CardTitle className="text-lg sm:text-xl leading-tight pt-4">
                                                {n.title}
                                            </CardTitle>

                                            {n.excerpt ? (
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {n.excerpt}
                                                </p>
                                            ) : null}
                                        </CardHeader>
                                    </Link>
                                </Card>
                            )
                        })}
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                        Arraste para o lado para ver mais notícias →
                    </p>
                </div>

                {/* =========================
            DESKTOP (lg+): grid tradicional
            ========================= */}
                <div className="mt-10 hidden lg:grid gap-6 lg:grid-cols-5">
                    {news.map((n) => {
                        const cover = getFirstImageSrc(n.contentHtml)
                        return (
                            <Card
                                key={String(n._id)}
                                className="
                  overflow-hidden pt-0 transition-all duration-300 ease-out
                  hover:-translate-y-2 hover:shadow-xl
                "
                            >
                                <Link href={`/home/news/${n._id}`}>
                                    {cover ? (
                                        <AspectRatio ratio={3 / 2.5} className="w-full overflow-hidden">
                                            <img
                                                src={cover}
                                                alt={n.title}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </AspectRatio>
                                    ) : (
                                        <div className="h-[220px] w-full bg-muted" />
                                    )}

                                    <CardHeader className="space-y-3">
                                        <CardTitle className="text-xl leading-tight pt-4">
                                            {n.title}
                                        </CardTitle>

                                        {n.excerpt ? (
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {n.excerpt}
                                            </p>
                                        ) : null}
                                    </CardHeader>
                                </Link>
                            </Card>
                        )
                    })}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/home/news"
                        className="inline-block rounded-md bg-slate-900 px-6 py-3 text-white transition-colors hover:bg-slate-700"
                    >
                        <Plus className="inline-block mr-2 h-5 w-5" />
                        Ver mais notícias
                    </Link>
                </div>
            </div>
        </section>
    )
}
