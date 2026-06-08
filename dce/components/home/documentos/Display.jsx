'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { FileText, Download, ExternalLink, ScrollText, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const TYPE_LABELS = {
    edital: "Edital",
    ata: "Ata de Reunião",
}

const TYPE_STYLES = {
    edital: "bg-blue-100 text-blue-700 border-blue-200",
    ata: "bg-purple-100 text-purple-700 border-purple-200",
}

function formatDate(dateStr) {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function DocumentCard({ doc }) {
    const date = formatDate(doc.publishedAt ?? doc.createdAt)

    return (
        <div className="group flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                        {doc.type === "ata" ? (
                            <ScrollText className="size-5 text-[#2708ab]" />
                        ) : (
                            <FileText className="size-5 text-[#2708ab]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 leading-snug">{doc.title}</p>
                        {date && (
                            <p className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                <Calendar className="size-3" />
                                {date}
                            </p>
                        )}
                    </div>
                </div>
                <Badge variant="outline" className={TYPE_STYLES[doc.type] ?? ""}>
                    {TYPE_LABELS[doc.type] ?? doc.type}
                </Badge>
            </div>

            {doc.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
            )}

            {doc.fileUrl && (
                <div className="flex items-center gap-2 pt-1">
                    <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border-2 border-[#2708ab] bg-[#fdf25a] px-3 py-1.5 text-sm font-bold text-[#2708ab] shadow-[2px_2px_0_#2708ab] transition-transform hover:-translate-y-0.5"
                    >
                        <ExternalLink className="size-4" />
                        Visualizar
                    </a>
                    <a
                        href={doc.fileUrl}
                        download
                        className="flex items-center gap-1.5 rounded-lg border border-input bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Download className="size-4" />
                        Baixar
                    </a>
                </div>
            )}
        </div>
    )
}

const TABS = [
    { value: "", label: "Todos" },
    { value: "edital", label: "Editais" },
    { value: "ata", label: "Atas de Reunião" },
]

export function DocumentsDisplay({ documents = [], years = [] }) {
    const router = useRouter()
    const params = useSearchParams()
    const activeType = params.get("type") ?? ""
    const activeYear = params.get("year") ?? ""
    const [search, setSearch] = useState("")

    function pushQuery(updates) {
        const sp = new URLSearchParams(params.toString())
        for (const [key, val] of Object.entries(updates)) {
            if (val) sp.set(key, val)
            else sp.delete(key)
        }
        const qs = sp.toString()
        router.push(qs ? `/home/documentos?${qs}` : "/home/documentos")
    }

    const filtered = documents.filter((doc) => {
        if (!search.trim()) return true
        return doc.title.toLowerCase().includes(search.toLowerCase())
    })

    const editais = filtered.filter((d) => d.type === "edital")
    const atas = filtered.filter((d) => d.type === "ata")
    const displayDocs = activeType === "edital" ? editais : activeType === "ata" ? atas : filtered

    return (
        <section className="w-full bg-[#f3f1ff] min-h-screen">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-12 md:px-10">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 border-b-4 border-[#2708ab] bg-[#fdf25a] px-4 py-2 shadow-[4px_4px_0_#2708ab]">
                            <FileText className="h-4 w-4 text-[#2708ab]" />
                            <h2 className="text-lg font-extrabold text-[#2708ab]">Editais e Atas</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Documentos oficiais, editais e atas de reunião do DCE.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:max-w-xs">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar documento..."
                                className="pl-9 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    {/* Tabs de tipo */}
                    <div className="flex items-center rounded-lg border bg-white p-1 gap-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => pushQuery({ type: tab.value })}
                                className={[
                                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                    activeType === tab.value
                                        ? "bg-[#2708ab] text-white"
                                        : "text-muted-foreground hover:bg-gray-100",
                                ].join(" ")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filtro por ano */}
                    {years.length > 0 && (
                        <select
                            value={activeYear}
                            onChange={(e) => pushQuery({ year: e.target.value })}
                            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="">Todos os anos</option>
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    )}

                    {(activeType || activeYear || search) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { pushQuery({ type: "", year: "" }); setSearch("") }}
                        >
                            Limpar filtros
                        </Button>
                    )}
                </div>

                {/* Conteúdo */}
                {displayDocs.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-white p-10 text-center border">
                        <FileText className="mb-3 size-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                            Nenhum documento encontrado.
                        </p>
                    </div>
                ) : activeType ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {displayDocs.map((doc) => (
                            <DocumentCard key={String(doc._id)} doc={doc} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {editais.length > 0 && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#2708ab]">
                                    <FileText className="size-4" />
                                    Editais
                                    <span className="ml-1 rounded-full bg-[#2708ab]/10 px-2 py-0.5 text-xs font-semibold">{editais.length}</span>
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {editais.map((doc) => (
                                        <DocumentCard key={String(doc._id)} doc={doc} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {atas.length > 0 && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#2708ab]">
                                    <ScrollText className="size-4" />
                                    Atas de Reunião
                                    <span className="ml-1 rounded-full bg-[#2708ab]/10 px-2 py-0.5 text-xs font-semibold">{atas.length}</span>
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {atas.map((doc) => (
                                        <DocumentCard key={String(doc._id)} doc={doc} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
