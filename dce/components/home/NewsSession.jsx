import Link from "next/link"
import { Construction } from "lucide-react"

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

                <div className="inline-flex bg-slate-900 px-4 py-2">
                    <h2 className="text-lg font-extrabold text-white">Nosso Jornal</h2>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                    {news.map((n) => (
                        <Card
                            key={String(n._id)}
                            className="overflow-hidden max-w-[300px] pt-0 transition-all duration-300 ease-out
    hover:-translate-y-2 hover:shadow-xl"
                        >
                            <Link href={`/home/news/${n._id}`}>
                                {getFirstImageSrc(n.contentHtml) ? (
                                    <AspectRatio ratio={3 / 2.5} className="w-full overflow-hidden rounded-t-xl">
                                        <img
                                            src={getFirstImageSrc(n.contentHtml)}
                                            alt={n.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </AspectRatio>
                                ) : (
                                    <div className="h-[260px] w-full bg-muted" />
                                )}
                                <CardHeader className="space-y-3">

                                    <CardTitle className="text-xl leading-tight pt-4">
                                        {n.title}
                                    </CardTitle>

                                    {n.excerpt ? (
                                        <p className="text-sm text-muted-foreground">{n.excerpt}</p>
                                    ) : null}

                                </CardHeader>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section >

    )
}
