'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { deleteInscricao, updateInscricaoStatus } from "@/lib/actions/inscricaoCargo"

const STATUS = {
    pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200" },
    em_analise: { label: "Em análise", className: "bg-blue-100 text-blue-700 border-blue-200" },
    aprovado: { label: "Aprovado", className: "bg-green-100 text-green-700 border-green-200" },
    rejeitado: { label: "Rejeitado", className: "bg-red-100 text-red-700 border-red-200" },
}

function formatDate(value) {
    if (!value) return "-"
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value))
}

export function Row({ inscricao, selected, onSelectChange }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const statusInfo = STATUS[inscricao.status] ?? STATUS.pendente

    async function setStatus(status) {
        try {
            const result = await updateInscricaoStatus({ id: String(inscricao._id), status })
            if (!result.success) { toast.error(result.message); return }
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao atualizar inscrição. " + (err?.message ?? ""))
        }
    }

    async function handleDelete() {
        try {
            const result = await deleteInscricao(String(inscricao._id))
            if (!result.success) { toast.error(result.message); return }
            toast.success(result.message)
            router.refresh()
        } catch (err) {
            toast.error("Erro ao remover inscrição. " + (err?.message ?? ""))
        }
    }

    return (
        <>
            <TableRow className={inscricao.status === "pendente" ? "bg-amber-50/40" : ""}>
                <TableCell className="w-10">
                    <input
                        type="checkbox"
                        aria-label="Selecionar inscrição"
                        checked={selected}
                        onChange={() => onSelectChange(String(inscricao._id))}
                        className="size-4 accent-[#2708ab]"
                    />
                </TableCell>
                <TableCell>
                    <div className="font-medium text-slate-900">{inscricao.name}</div>
                    <a className="text-sm text-muted-foreground hover:text-[#2708ab]" href={`mailto:${inscricao.email}`}>
                        {inscricao.email}
                    </a>
                </TableCell>
                <TableCell>
                    <div className="text-sm font-medium text-slate-800">{inscricao.course}</div>
                    <div className="text-xs text-muted-foreground">{inscricao.semester}</div>
                </TableCell>
                <TableCell className="max-w-xs">
                    <span className="font-medium text-slate-800">{inscricao.cargo}</span>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={statusInfo.className}>
                        {statusInfo.label}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(inscricao.createdAt)}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setOpen(true)} title="Ver inscrição">
                            <Eye className="size-4" />
                        </Button>
                        <ConfirmDialog
                            title="Remover inscrição"
                            subtitle="Tem certeza que deseja remover esta inscrição? Esta ação não pode ser desfeita."
                            onClick={handleDelete}
                        >
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" title="Remover">
                                <Trash2 className="size-4" />
                            </Button>
                        </ConfirmDialog>
                    </div>
                </TableCell>
            </TableRow>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{inscricao.name}</SheetTitle>
                        <SheetDescription>
                            {inscricao.email} · {formatDate(inscricao.createdAt)}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-4 flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" className={statusInfo.className}>
                                {statusInfo.label}
                            </Badge>
                            <Badge variant="outline" className="bg-[#2708ab]/10 text-[#2708ab] border-[#2708ab]/20">
                                {inscricao.cargo}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md border bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-400">Curso</p>
                                <p className="mt-1 text-slate-800">{inscricao.course}</p>
                            </div>
                            <div className="rounded-md border bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-400">Semestre</p>
                                <p className="mt-1 text-slate-800">{inscricao.semester}</p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase text-slate-400">Motivação</p>
                            <div className="whitespace-pre-wrap rounded-md border bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                                {inscricao.motivation}
                            </div>
                        </div>

                        <div className="rounded-md border bg-white p-3 text-sm text-slate-700">
                            <p className="text-xs font-semibold uppercase text-slate-400">IP</p>
                            <p className="mt-1 break-all">{inscricao.ipAddress || "Não identificado"}</p>
                        </div>
                    </div>

                    <SheetFooter>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={inscricao.status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-md border px-3 py-1.5 text-sm focus:border-[#2708ab] focus:ring-1 focus:ring-[#2708ab] outline-none"
                            >
                                <option value="pendente">Pendente</option>
                                <option value="em_analise">Em análise</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="rejeitado">Rejeitado</option>
                            </select>
                            <Button asChild variant="outline">
                                <a href={`mailto:${inscricao.email}?subject=${encodeURIComponent(`Sua inscrição para ${inscricao.cargo} — DCE UNIOESTE`)}`}>
                                    Responder por email
                                </a>
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
