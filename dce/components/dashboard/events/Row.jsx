'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { PenSquare, Trash2, Globe, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useRouter } from "next/navigation"
import { formatDate } from "../../ui/formatDate"
import { toast } from "sonner"
import { deleteEvent, publishEvent } from "@/lib/actions/event"

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

    async function handlePublish() {
        try {
            const res = await publishEvent(eventItem._id)
            if (!res.success) throw new Error(res.message)
            router.refresh()
            toast.success("Evento publicado com sucesso.")
        } catch (err) {
            toast.error("Erro ao publicar o evento. " + (err?.message ?? ""))
        }
    }

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
                    {eventItem.status !== "published" && (
                        <ConfirmDialog
                            title="Publicar evento"
                            subtitle="Tem certeza que deseja publicar este evento?"
                            onClick={handlePublish}
                        >
                            <Button variant="ghost" size="icon" title="Publicar">
                                <Globe className="size-4" />
                            </Button>
                        </ConfirmDialog>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Ver inscrições"
                        onClick={() => router.push(`/dashboard/events/${eventItem._id}/registrations`)}
                    >
                        <ClipboardList className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
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
