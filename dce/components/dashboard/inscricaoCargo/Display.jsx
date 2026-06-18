'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { deleteManyInscricoes } from "@/lib/actions/inscricaoCargo"
import { Row } from "./Row"

const STATUS_OPTIONS = [
    { value: "", label: "Todos os status" },
    { value: "pendente", label: "Pendente" },
    { value: "em_analise", label: "Em análise" },
    { value: "aprovado", label: "Aprovado" },
    { value: "rejeitado", label: "Rejeitado" },
]

export function Display({ inscricoes, total, pending }) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedIds, setSelectedIds] = useState([])

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        return inscricoes.filter((i) => {
            const matchesStatus = !statusFilter || i.status === statusFilter
            const matchesSearch = !term ||
                i.name?.toLowerCase().includes(term) ||
                i.email?.toLowerCase().includes(term) ||
                i.course?.toLowerCase().includes(term) ||
                i.cargo?.toLowerCase().includes(term)
            return matchesStatus && matchesSearch
        })
    }, [inscricoes, search, statusFilter])

    const inscricaoIds = useMemo(() => filtered.map((i) => String(i._id)), [filtered])
    const selectedCount = selectedIds.length
    const hasSelection = selectedCount > 0
    const allSelected = inscricaoIds.length > 0 && selectedCount === inscricaoIds.length

    function toggleSelected(id) {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        )
    }

    function toggleAllSelected() {
        setSelectedIds(allSelected ? [] : inscricaoIds)
    }

    async function handleDeleteSelected() {
        try {
            const result = await deleteManyInscricoes(selectedIds)
            if (!result.success) { toast.error(result.message); return }
            setSelectedIds([])
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao remover inscrições. " + (err?.message ?? ""))
        }
    }

    return (
        <div>
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <ClipboardList className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Inscrições de Cargo</h1>
                            <p className="text-sm text-muted-foreground">
                                {total} inscrição(ões) recebida(s) · {pending} pendente(s)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email, curso ou cargo..."
                        value={search}
                        className="pl-9"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm bg-white focus:border-[#2708ab] focus:ring-1 focus:ring-[#2708ab] outline-none"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection
                        ? `${selectedCount} selecionada(s)`
                        : `${filtered.length} inscrição(ões) exibida(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir inscrições selecionadas"
                    subtitle={`Tem certeza que deseja deletar ${selectedCount} inscrição(ões)? Esta ação não pode ser desfeita.`}
                    onClick={handleDeleteSelected}
                >
                    <Button variant="destructive" disabled={!hasSelection} size="sm">
                        <Trash2 className="size-4" />
                        Excluir selecionadas
                    </Button>
                </ConfirmDialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                aria-label="Selecionar todas"
                                checked={allSelected}
                                onChange={toggleAllSelected}
                                className="size-4 accent-[#2708ab]"
                            />
                        </TableHead>
                        <TableHead>Candidato</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recebida em</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhuma inscrição encontrada.
                            </td>
                        </tr>
                    ) : filtered.map((inscricao) => (
                        <Row
                            key={inscricao._id}
                            inscricao={inscricao}
                            selected={selectedIds.includes(String(inscricao._id))}
                            onSelectChange={toggleSelected}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
