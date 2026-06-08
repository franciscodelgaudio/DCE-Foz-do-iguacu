'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { PenSquare, Trash2, Globe, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteDocument, publishDocument } from "@/lib/actions/documents"

const TYPE_LABELS = {
    edital: "Edital",
    ata: "Ata de Reunião",
}

const TYPE_STYLES = {
    edital: "bg-blue-100 text-blue-700 border-blue-200",
    ata: "bg-purple-100 text-purple-700 border-purple-200",
}

const STATUS_STYLES = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    draft: "bg-muted text-muted-foreground border-muted",
}

function TypeBadge({ value }) {
    const label = TYPE_LABELS[value] ?? value
    const cls = TYPE_STYLES[value] ?? "bg-muted text-muted-foreground border-muted"
    return <Badge variant="outline" className={cls}>{label}</Badge>
}

function StatusBadge({ value }) {
    const label = value === "published" ? "Publicado" : "Rascunho"
    const cls = STATUS_STYLES[value] ?? "bg-muted text-muted-foreground border-muted"
    return <Badge variant="outline" className={cls}>{label}</Badge>
}

export function Row({ document, selected = false, onSelectChange }) {
    const router = useRouter()

    async function handleDelete() {
        try {
            await deleteDocument(document._id)
            router.refresh()
            toast.success("Documento deletado com sucesso.")
        } catch (err) {
            toast.error("Erro ao deletar o documento. " + (err?.message ?? ""))
        }
    }

    async function handlePublish() {
        try {
            const res = await publishDocument(document._id)
            if (!res.success) throw new Error(res.message)
            router.refresh()
            toast.success("Documento publicado com sucesso.")
        } catch (err) {
            toast.error("Erro ao publicar o documento. " + (err?.message ?? ""))
        }
    }

    return (
        <TableRow>
            <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                <input
                    type="checkbox"
                    aria-label={`Selecionar ${document.title}`}
                    checked={selected}
                    onChange={() => onSelectChange?.(document._id)}
                    className="size-4 accent-[#2708ab]"
                />
            </TableCell>
            <TableCell className="font-medium">{document.title}</TableCell>
            <TableCell><TypeBadge value={document.type} /></TableCell>
            <TableCell>{document.year ?? "-"}</TableCell>
            <TableCell>{document.author?.name ?? "-"}</TableCell>
            <TableCell><StatusBadge value={document.status} /></TableCell>
            <TableCell onClick={(e) => e.stopPropagation()} className="cursor-default">
                <div className="flex flex-row items-center gap-2">
                    {document.fileUrl && (
                        <Button variant="ghost" size="icon" asChild title="Abrir arquivo">
                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="size-4" />
                            </a>
                        </Button>
                    )}
                    {document.status !== "published" && (
                        <ConfirmDialog
                            title="Publicar documento"
                            subtitle="Tem certeza que deseja publicar este documento?"
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
                        onClick={() => router.push(`/dashboard/documentos/${document._id}`)}
                        title="Editar"
                    >
                        <PenSquare className="size-4" />
                    </Button>
                    <ConfirmDialog
                        title="Excluir documento"
                        subtitle="Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita."
                        onClick={handleDelete}
                    >
                        <Button variant="ghost" size="icon">
                            <Trash2 className="size-4" />
                        </Button>
                    </ConfirmDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}
