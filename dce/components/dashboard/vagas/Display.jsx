'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
import { Briefcase, Plus, Search, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"
import { deleteManyJobs } from "@/lib/actions/jobs"

export function Display({ jobs, total }) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState([])

    const filtered = useMemo(() => {
        if (!search.trim()) return jobs
        return jobs.filter((j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            (j.area ?? "").toLowerCase().includes(search.toLowerCase())
        )
    }, [jobs, search])

    const jobIds = useMemo(() => filtered.map((j) => String(j._id)), [filtered])
    const selectedCount = selectedIds.length
    const hasSelection = selectedCount > 0
    const allSelected = jobIds.length > 0 && selectedCount === jobIds.length

    function toggleSelected(id) {
        setSelectedIds((cur) =>
            cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]
        )
    }

    function toggleAllSelected() {
        setSelectedIds(allSelected ? [] : jobIds)
    }

    async function handleDeleteSelected() {
        try {
            const result = await deleteManyJobs(selectedIds)
            if (!result.success) { toast.error(result.message); return }
            setSelectedIds([])
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao deletar vagas. " + (err?.message ?? ""))
        }
    }

    return (
        <div>
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <Briefcase className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Vagas</h1>
                            <p className="text-sm text-muted-foreground">
                                {total} vaga{total !== 1 ? "s" : ""} cadastrada{total !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.push("/dashboard/vagas/createVaga")}>
                        <Plus className="size-4" />
                        Nova vaga
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título ou área…"
                        value={search}
                        className="pl-9"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection
                        ? `${selectedCount} selecionada(s)`
                        : `${filtered.length} vaga(s) exibida(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir vagas selecionadas"
                    subtitle={`Tem certeza que deseja deletar ${selectedCount} vaga(s)? Esta ação não pode ser desfeita.`}
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
                        <TableHead>Título</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>Carga Horária</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhuma vaga encontrada.
                            </td>
                        </tr>
                    ) : filtered.map((item) => (
                        <Row
                            key={item._id}
                            jobItem={item}
                            selected={selectedIds.includes(String(item._id))}
                            onSelectChange={toggleSelected}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
