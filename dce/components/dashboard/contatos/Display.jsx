'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Inbox, Search, Trash2 } from "lucide-react"
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
import { deleteManyContactMessages } from "@/lib/actions/contact"
import { Row } from "./Row"

export function Display({ messages, total, unread, emailEnabled }) {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState([])

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return messages
        return messages.filter((message) =>
            message.name?.toLowerCase().includes(term) ||
            message.email?.toLowerCase().includes(term) ||
            message.subject?.toLowerCase().includes(term) ||
            message.message?.toLowerCase().includes(term)
        )
    }, [messages, search])

    const messageIds = useMemo(() => filtered.map((message) => String(message._id)), [filtered])
    const selectedCount = selectedIds.length
    const hasSelection = selectedCount > 0
    const allSelected = messageIds.length > 0 && selectedCount === messageIds.length

    function toggleSelected(id) {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        )
    }

    function toggleAllSelected() {
        setSelectedIds(allSelected ? [] : messageIds)
    }

    async function handleDeleteSelected() {
        try {
            const result = await deleteManyContactMessages(selectedIds)
            if (!result.success) { toast.error(result.message); return }
            setSelectedIds([])
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao remover mensagens. " + (err?.message ?? ""))
        }
    }

    return (
        <div>
            <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                            <Inbox className="size-5 text-[#2708ab]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Contatos</h1>
                            <p className="text-sm text-muted-foreground">
                                {total} mensagem{total !== 1 ? "s" : ""} recebida{total !== 1 ? "s" : ""} · {unread} não lida{unread !== 1 ? "s" : ""}
                                {!emailEnabled && " · email não configurado"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50/60 px-6 py-3">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email, assunto ou mensagem..."
                        value={search}
                        className="pl-9"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <p className="text-sm text-muted-foreground">
                    {hasSelection
                        ? `${selectedCount} selecionada(s)`
                        : `${filtered.length} mensagem(ns) exibida(s)`}
                </p>
                <ConfirmDialog
                    title="Excluir mensagens selecionadas"
                    subtitle={`Tem certeza que deseja deletar ${selectedCount} mensagem(ns)? Esta ação não pode ser desfeita.`}
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
                        <TableHead>Contato</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recebida em</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                                Nenhuma mensagem encontrada.
                            </td>
                        </tr>
                    ) : filtered.map((message) => (
                        <Row
                            key={message._id}
                            message={message}
                            selected={selectedIds.includes(String(message._id))}
                            onSelectChange={toggleSelected}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
