"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis } from "recharts"
import {
    FilePlus2, CalendarPlus, Eye, Pencil, Clock,
    CheckCircle2, ArrowRight, Calendar, Newspaper,
} from "lucide-react"

const statusLabels = {
    published: "Publicado",
    draft: "Rascunho",
    scheduled: "Agendado",
    archived: "Arquivado",
}

const statusVariants = {
    published: "default",
    draft: "secondary",
    scheduled: "outline",
    archived: "destructive",
}

function formatAxisDate(iso) {
    const [, m, d] = iso.split("-")
    return `${d}/${m}`
}

function formatShortDate(iso) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

const last7Config = { published: { label: "Publicados" } }

function KpiCard({ title, value, icon: Icon, primary }) {
    return (
        <Card className="rounded-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
                <span className={`text-3xl font-extrabold${primary ? " text-primary" : ""}`}>{value}</span>
                <Icon className={`h-5 w-5${primary ? " text-primary" : " text-muted-foreground"}`} />
            </CardContent>
        </Card>
    )
}

export function Display({ name, stats, eventStats }) {
    const t = stats.totals

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Olá, {name}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Painel de controle do DCE — visão geral do conteúdo publicado.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                        <Link href="/dashboard/news/createNews">
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Nova notícia
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard/events/createEvent">
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Novo evento
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <KpiCard title="Total de notícias" value={t.total} icon={Newspaper} />
                <KpiCard title="Publicadas" value={t.published} icon={CheckCircle2} primary />
                <KpiCard title="Rascunhos" value={t.draft} icon={Pencil} />
                <KpiCard title="Agendadas" value={t.scheduled} icon={Clock} />
                <KpiCard title="Visualizações" value={t.views} icon={Eye} />
            </div>

            {/* Gráfico + Próximos eventos */}
            <div className="grid gap-4 lg:grid-cols-2">

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Publicações nos últimos 7 dias</CardTitle>
                        <p className="text-sm text-muted-foreground">Artigos publicados por dia.</p>
                    </CardHeader>
                    <CardContent className="h-[240px]">
                        <ChartContainer config={last7Config} className="h-full w-full">
                            <LineChart data={stats.last7Days}>
                                <XAxis dataKey="date" tickFormatter={formatAxisDate} />
                                <YAxis allowDecimals={false} />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(v) => `Dia ${formatAxisDate(String(v))}`}
                                        />
                                    }
                                />
                                <Line type="monotone" dataKey="published" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Próximos eventos</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {eventStats.totalEvents} evento{eventStats.totalEvents !== 1 ? "s" : ""} cadastrado{eventStats.totalEvents !== 1 ? "s" : ""}.
                            </p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/events">
                                Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {eventStats.upcoming.length ? (
                            <ul className="space-y-3">
                                {eventStats.upcoming.map((e) => (
                                    <li key={e.id} className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <Link
                                                href={`/dashboard/events/${e.id}`}
                                                className="truncate text-sm font-medium hover:underline"
                                            >
                                                {e.title}
                                            </Link>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {e.location && (
                                                <span className="hidden text-xs text-muted-foreground sm:block">
                                                    {e.location}
                                                </span>
                                            )}
                                            <Badge variant="outline" className="text-xs">
                                                {formatShortDate(e.eventDate)}
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nenhum evento publicado futuro.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top notícias + Atividade recente */}
            <div className="grid gap-4 lg:grid-cols-2">

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Top notícias por views</CardTitle>
                        <p className="text-sm text-muted-foreground">As 5 mais acessadas.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/40">
                                    <tr className="text-left">
                                        <th className="px-3 py-2 font-medium">Título</th>
                                        <th className="px-3 py-2 font-medium">Status</th>
                                        <th className="px-3 py-2 text-right font-medium">Views</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.topPosts.length ? (
                                        stats.topPosts.map((p) => (
                                            <tr key={p.id} className="border-t transition-colors hover:bg-muted/20">
                                                <td className="px-3 py-2">
                                                    <Link
                                                        href={`/dashboard/news/${p.id}`}
                                                        className="line-clamp-1 font-medium hover:underline"
                                                    >
                                                        {p.title}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={statusVariants[p.status] ?? "secondary"}>
                                                        {statusLabels[p.status] ?? p.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-2 text-right">{p.viewCount}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-3 py-6 text-muted-foreground" colSpan={3}>
                                                Nenhuma notícia encontrada ainda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Atividade recente</CardTitle>
                            <p className="text-sm text-muted-foreground">Últimas notícias editadas.</p>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard/news">
                                Ver todas <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {stats.recentArticles.length ? (
                            <ul className="space-y-3">
                                {stats.recentArticles.map((p) => (
                                    <li key={p.id} className="flex items-center justify-between gap-3">
                                        <Link
                                            href={`/dashboard/news/${p.id}`}
                                            className="truncate text-sm font-medium hover:underline"
                                        >
                                            {p.title}
                                        </Link>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="hidden text-xs text-muted-foreground sm:block">
                                                {formatShortDate(p.updatedAt)}
                                            </span>
                                            <Badge variant={statusVariants[p.status] ?? "secondary"}>
                                                {statusLabels[p.status] ?? p.status}
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nenhuma notícia ainda.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
