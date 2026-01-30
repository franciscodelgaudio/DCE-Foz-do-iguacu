'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, Newspaper } from "lucide-react"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"

function getFirstImageSrc(html) {
    if (!html) return null
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
    return match?.[1] ?? null
}

function formatDate(value) {
    if (!value) return ""
    const d = new Date(value)
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function Display({ news = [] }) {
    const router = useRouter()
    const params = useSearchParams()

    const activeTitle = params.get("title") ?? ""

    const [title, setTitle] = useState(activeTitle)

    // mantém o input sincronizado ao navegar (back/forward, links, etc.)
    useEffect(() => {
        setTitle(activeTitle)
    }, [activeTitle])

    function pushQuery(nextTitle) {
        const sp = new URLSearchParams(params.toString())
        const trimmed = (nextTitle ?? "").trim()

        if (trimmed) sp.set("title", trimmed)
        else sp.delete("title")

        const qs = sp.toString()
        router.push(qs ? `/home/news?${qs}` : "/home/news")
    }

    return (
        <section className="w-full bg-gray-200">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-12 md:px-10">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2">
                            <Newspaper className="h-4 w-4 text-white" />
                            <h2 className="text-lg font-extrabold text-white">Nosso Jornal</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Acompanhe as publicações do DCE — notícias, eventos e comunicados.
                        </p>
                    </div>

                    {/* Busca */}
                    <form
                        className="w-full md:max-w-md"
                        onSubmit={(e) => {
                            e.preventDefault()
                            pushQuery(title)
                        }}
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

                            <Button type="submit" className="shrink-0">
                                Buscar
                            </Button>
                        </div>

                        {activeTitle ? (
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="secondary">Filtro: {activeTitle}</Badge>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-7 px-2"
                                    onClick={() => pushQuery("")}
                                >
                                    Limpar
                                </Button>
                            </div>
                        ) : null}
                    </form>
                </div>

                {/* Conteúdo */}
                <div className="mt-10">
                    {!news.length ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md bg-muted p-10 text-center">
                            <p className="text-sm text-muted-foreground">
                                {activeTitle
                                    ? "Nenhuma notícia encontrada para esse termo."
                                    : "Ainda não há notícias publicadas."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {news.map((n) => {
                                const img = getFirstImageSrc(n.contentHtml)
                                const date = n.publishedAt ? formatDate(n.publishedAt) : null

                                return (
                                    <Card
                                        key={String(n._id)}
                                        className="group overflow-hidden pt-0 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl"
                                    >
                                        <Link href={`/home/news/${n._id}`} className="block">
                                            <div className="overflow-hidden">
                                                {img ? (
                                                    <AspectRatio ratio={3 / 3} className="w-full overflow-hidden">
                                                        <img
                                                            src={img}
                                                            alt={n.title}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                    </AspectRatio>
                                                ) : (
                                                    <div className="h-[240px] w-full bg-muted" />
                                                )}
                                            </div>

                                            <CardHeader className="space-y-3 pt-4">
                                                <div className="flex items-center justify-between">
                                                    {date ? (
                                                        <span className="text-xs text-muted-foreground">{date}</span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                    <Badge variant="secondary">Jornal</Badge>
                                                </div>

                                                <CardTitle className="text-base leading-snug line-clamp-2">
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
                    )}
                </div>
            </div>
        </section>
    )
}
