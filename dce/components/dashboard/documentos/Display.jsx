'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Row } from "./Row"
import {
    ChevronDown, ChevronUp, ChevronsUpDown,
    CircleDot, FileText, Plus, Search, Settings, Trash2, User, Calendar,
} from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"
import { deleteManyDocuments } from "@/lib/actions/documents"

const TYPE_OPTIONS = [
    { value: "", label: "Todos os tipos" },
    { value: "edital", label: "Edital" },
    { value: "ata", label: "Ata de Reunião" },
]

const STATUS_OPTIONS = [
    { value: "", label: "Todos os status" },
    { value: "draft", label: "Rascunho" },
    { value: "published", label: "Publicado" },
]

const COLUMNS = [
    { key: "title", label: "Título", icon: FileText },
    { key: "type", label: "Tipo", icon: CircleDot },
    { key: "year", label: "Ano", icon: Calendar },
    { key: "author.name", label: "Autor", icon: User },
    { key: "status", label: "Status", icon: CircleDot },
]

function SortIcon({ column, sortBy, sortDir }) {
    if (sortBy !== column) return <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />
    return sortDir === "asc"
        ? <ChevronUp className="size-3.5" />
        : <ChevronDown className="size-3.5" />
}

export function Display({ documents, total }) {
    const router = useRouter()
    const params = useSearchParams()

    const activeTitle = params.get("title") ?? ""
    const activeType = params.get("type") ?? ""
    const activeStatus = params.get("status") ?? ""
    const activeSortBy = params.get("sortBy") ?? "createdAt"
    const activeSortDir = params.get("sortDir") ?? "desc"

    const [titleInput, setTitleInput] = useState(activeTitle)
    const [selectedIds, setSelectedIds] = useState([])

    function pushQuery(updates) {
        const sp = new URLSearchParams(params.toString())
        for (const [key, val] of Object.entries(updates)) {
            if (val) sp.set(key, val)
            else sp.delete(key)
        }
        router.push(`/dashboard/documentos?${sp.toString()}`)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            pushQuery({ title: titleInput.trim() })
        }, 400)
        return () => clearTimeout(timer)
    }, [titleInput])

    function handleSort(column) {
        if (activeSortBy === column) {
            pushQuery({ sortBy: column, sortDir: activeSortDir === "asc" ? "desc" : "asc" })
        } else {
            pushQuery({ sortBy: column, sortDir: "asc" })
        }
    }

    const docIds = useMemo(() => documents.map((item) => String(item._id)), [documents])
    const selectedCount = selectedIds.length
    const hasSelection = selectedCount > 0
    const allSelected = docIds.length > 0 && selectedCount === docIds.length

    function toggleSelected(docId) {
        setSelectedIds((current) => {
            const id = String(docId)
            return current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        })
    }

    function toggleAllSelected() {
        setSelectedIds(allSelected ? [] : docIds)
    }

    async function handleDeleteSelected() {
        try {
            const result = await deleteManyDocuments(selectedIds)
            if (!result.success) { toast.error(result.message); return }
            setSelectedIds([])
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao deletar documentos. " + (err?.message ?? ""))
        }
    }

    return (
        <div>
            {/* Page Header */}
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <FileText className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Editais e Atas</h1>
                            <p className="text-sm text-muted-foreground">
                                {documents.length} de {total} documento{total !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.push("/dashboard/documentos/create")}>
                        <Plus className="size-4" />
                        Novo documento
                    </Button>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título..."
                        value={titleInput}
                        className="pl-9"
                        onChange={(e) => setTitleInput(e.target.value)}
                    />
                </div>
                <select
                    value={activeType}
                    onChange={(e) => pushQuery({ type: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <select
                    value={activeStatus}
                    onChange={(e) => pushQuery({ status: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Batch actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection
                        ? `${selectedCount} selecionado(s)`
                        : `${documents.length} documento(s) exibido(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir documentos selecionados"
                    subtitle={`Tem certeza que deseja deletar ${selectedCount} documento(s)? Esta ação não pode ser desfeita.`}
                    onClick={handleDeleteSelected}
                >
                    <Button variant="destructive" disabled={!hasSelection} size="sm">
                        <Trash2 className="size-4" />
                        Excluir selecionados
                    </Button>
                </ConfirmDialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                aria-label="Selecionar todos os documentos"
                                checked={allSelected}
                                onChange={toggleAllSelected}
                                className="size-4 accent-[#2708ab]"
                            />
                        </TableHead>
                        {COLUMNS.map(({ key, label, icon: Icon }) => (
                            <TableHead
                                key={key}
                                className="cursor-pointer select-none"
                                onClick={() => handleSort(key)}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4" />
                                    <span>{label}</span>
                                    <SortIcon column={key} sortBy={activeSortBy} sortDir={activeSortDir} />
                                </div>
                            </TableHead>
                        ))}
                        <TableHead>
                            <div className="flex items-center gap-2">
                                <Settings className="size-4" />
                                <span>Ações</span>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhum documento encontrado.
                            </td>
                        </tr>
                    ) : documents.map((item) => (
                        <Row
                            key={item._id}
                            document={item}
                            selected={selectedIds.includes(String(item._id))}
                            onSelectChange={toggleSelected}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
