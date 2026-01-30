"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    BarChart,
    Bar,
} from "recharts"

import { FilePlus2, Newspaper, Eye, Clock, Pencil, CheckCircle2 } from "lucide-react"

function formatDateBR(iso) {
    const [y, m, d] = iso.split("-")
    return `${d}/${m}`
}

// configs do shadcn chart (serve p/ legenda/tooltip com label)
const last7Config = {
    published: { label: "Publicados" },
}

const categoryConfig = {
    count: { label: "Artigos" },
}

export function Display({ name, stats }) {
    const t = stats.totals

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        Olá, {name} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Aqui está um resumo do desempenho do jornal e do seu fluxo editorial.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/dashboard/news/createNews">
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Nova notícia
                        </Link>
                    </Button>

                    <Button variant="outline" asChild>
                        <Link href="/dashboard/news">
                            <Newspaper className="mr-2 h-4 w-4" />
                            Ver notícias
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div className="text-3xl font-extrabold">{t.total}</div>
                        <Badge variant="secondary">Artigos</Badge>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Publicados</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div className="text-3xl font-extrabold">{t.published}</div>
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div className="text-3xl font-extrabold">{t.draft}</div>
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Views</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                        <div className="text-3xl font-extrabold">{t.views}</div>
                        <Eye className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Line chart (shadcn chart wrapper) */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Publicações nos últimos 7 dias</CardTitle>
                        <p className="text-sm text-muted-foreground">Apenas artigos com status publicado.</p>
                    </CardHeader>

                    <CardContent className="h-[280px]">
                        <ChartContainer config={last7Config} className="h-full w-full">
                            <LineChart data={stats.last7Days}>
                                <XAxis dataKey="date" tickFormatter={formatDateBR} />
                                <YAxis allowDecimals={false} />

                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(v) => `Dia ${formatDateBR(String(v))}`}
                                        />
                                    }
                                />

                                <Line type="monotone" dataKey="published" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Bar chart (shadcn chart wrapper) */}
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Categorias mais usadas</CardTitle>
                        <p className="text-sm text-muted-foreground">Top categorias por quantidade de artigos.</p>
                    </CardHeader>

                    <CardContent className="h-[280px]">
                        <ChartContainer config={categoryConfig} className="h-full w-full">
                            <BarChart data={stats.byCategory}>
                                {/* pode esconder o eixo se tiver muitos */}
                                <XAxis dataKey="category" hide />
                                <YAxis allowDecimals={false} />

                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(v) => String(v)}
                                            formatter={(value) => [value, "Artigos"]}
                                        />
                                    }
                                />

                                <Bar dataKey="count" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Table / Top Posts */}
            <Card className="rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Top matérias por visualizações</CardTitle>
                        <p className="text-sm text-muted-foreground">As 5 mais acessadas.</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Atualizado agora</span>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40">
                                <tr className="text-left">
                                    <th className="px-3 py-2 font-medium">Título</th>
                                    <th className="px-3 py-2 font-medium">Status</th>
                                    <th className="px-3 py-2 font-medium">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topPosts.length ? (
                                    stats.topPosts.map((p) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="px-3 py-2">
                                                <span className="line-clamp-1 font-medium">{p.title}</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant={p.status === "published" ? "default" : "secondary"}>
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2">{p.viewCount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-3 py-6 text-muted-foreground" colSpan={3}>
                                            Nenhuma matéria encontrada ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">Agendados: {stats.totals.scheduled}</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
