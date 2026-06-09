'use client'

import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteJob } from "@/lib/actions/jobs"

const STATUS_LABELS = {
    open: { label: "Aberta", className: "bg-green-100 text-green-700 border-green-200" },
    closed: { label: "Encerrada", className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
}

export function Row({ jobItem, selected, onSelectChange }) {
    const router = useRouter()

    async function handleDelete() {
        try {
            const result = await deleteJob(String(jobItem._id))
            if (!result.success) { toast.error(result.message); return }
            toast.success(result.message)
            router.refresh()
        } catch (err) {
            toast.error("Erro ao remover vaga. " + (err?.message ?? ""))
        }
    }

    const statusInfo = STATUS_LABELS[jobItem.status] ?? STATUS_LABELS.open

    return (
        <TableRow>
            <TableCell className="w-10">
                <input
                    type="checkbox"
                    aria-label="Selecionar vaga"
                    checked={selected}
                    onChange={() => onSelectChange(String(jobItem._id))}
                    className="size-4 accent-[#2708ab]"
                />
            </TableCell>
            <TableCell className="font-medium">{jobItem.title}</TableCell>
            <TableCell className="text-muted-foreground">{jobItem.area || "—"}</TableCell>
            <TableCell className="text-muted-foreground">{jobItem.workload || "—"}</TableCell>
            <TableCell>
                <Badge variant="outline" className={statusInfo.className}>
                    {statusInfo.label}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/dashboard/vagas/${jobItem._id}`)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    <ConfirmDialog
                        title="Remover vaga"
                        subtitle="Tem certeza que deseja remover esta vaga? Esta ação não pode ser desfeita."
                        onClick={handleDelete}
                    >
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                            <Trash2 className="size-4" />
                        </Button>
                    </ConfirmDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}
