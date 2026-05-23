'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { PenSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useRouter } from "next/navigation"
import { formatDate } from "../../ui/formatDate"
import { toast } from "sonner"
import { deleteEvent } from "@/lib/actions/event"

const STATUS_OPTIONS = [
    { value: "draft", label: "Rascunho" },
    { value: "published", label: "Publicado" },
    { value: "archived", label: "Arquivado" },
]

const STATUS_STYLES = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    archived: "bg-slate-100 text-slate-700 border-slate-200",
    draft: "bg-muted text-muted-foreground border-muted",
}

function StatusBadge({ value }) {
    const option = STATUS_OPTIONS.find((o) => o.value === value)
    const label = option?.label ?? "—"
    const cls = STATUS_STYLES[value] ?? "bg-muted text-muted-foreground border-muted"
    return <Badge variant="outline" className={cls}>{label}</Badge>
}

export function Row({ eventItem, selected = false, onSelectChange }) {
    const router = useRouter()

    async function handleDelete() {
        try {
            await deleteEvent(eventItem._id)
            router.refresh()
            toast.success("Evento deletado com sucesso.")
        } catch (err) {
            toast.error("Erro ao deletar o evento. " + (err?.message ?? ""))
        }
    }

    return (
        <TableRow>
            <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                <input
                    type="checkbox"
                    aria-label={`Selecionar ${eventItem.title}`}
                    checked={selected}
                    onChange={() => onSelectChange?.(eventItem._id)}
                    className="size-4 accent-[#2708ab]"
                />
            </TableCell>
            <TableCell>{eventItem.title}</TableCell>
            <TableCell>{eventItem.location || "—"}</TableCell>
            <TableCell>{formatDate(eventItem.eventDate) ?? "—"}</TableCell>
            <TableCell>{eventItem.author?.name ?? "—"}</TableCell>
            <TableCell><StatusBadge value={eventItem.status} /></TableCell>
            <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                <div className="flex flex-row items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/events/${eventItem._id}`)}
                    >
                        <PenSquare className="size-4" />
                    </Button>
                    <ConfirmDialog
                        title="Excluir evento"
                        subtitle="Tem certeza que deseja deletar este evento?"
                        onClick={handleDelete}
                    >
                        <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </ConfirmDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}
