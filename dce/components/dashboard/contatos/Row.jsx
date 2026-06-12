'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCheck, Eye, Mail, MailOpen, Reply, Trash2 } from "lucide-react"
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
import { deleteContactMessage, updateContactStatus } from "@/lib/actions/contact"

const STATUS = {
    unread: { label: "Não lida", className: "bg-amber-100 text-amber-700 border-amber-200" },
    read: { label: "Lida", className: "bg-blue-100 text-blue-700 border-blue-200" },
    replied: { label: "Respondida", className: "bg-green-100 text-green-700 border-green-200" },
}

function formatDate(value) {
    if (!value) return "-"
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value))
}

export function Row({ message, selected, onSelectChange }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const statusInfo = STATUS[message.status] ?? STATUS.unread

    async function setStatus(status) {
        try {
            const result = await updateContactStatus({ id: String(message._id), status })
            if (!result.success) { toast.error(result.message); return }
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao atualizar mensagem. " + (err?.message ?? ""))
        }
    }

    async function handleOpenChange(nextOpen) {
        setOpen(nextOpen)
        if (nextOpen && message.status === "unread") {
            await setStatus("read")
        }
    }

    async function handleDelete() {
        try {
            const result = await deleteContactMessage(String(message._id))
            if (!result.success) { toast.error(result.message); return }
            toast.success(result.message)
            router.refresh()
        } catch (err) {
            toast.error("Erro ao remover mensagem. " + (err?.message ?? ""))
        }
    }

    return (
        <>
            <TableRow className={message.status === "unread" ? "bg-amber-50/40" : ""}>
                <TableCell className="w-10">
                    <input
                        type="checkbox"
                        aria-label="Selecionar mensagem"
                        checked={selected}
                        onChange={() => onSelectChange(String(message._id))}
                        className="size-4 accent-[#2708ab]"
                    />
                </TableCell>
                <TableCell>
                    <div className="font-medium text-slate-900">{message.name}</div>
                    <a className="text-sm text-muted-foreground hover:text-[#2708ab]" href={`mailto:${message.email}`}>
                        {message.email}
                    </a>
                </TableCell>
                <TableCell className="max-w-sm">
                    <button
                        type="button"
                        onClick={() => handleOpenChange(true)}
                        className="block w-full truncate text-left font-medium text-slate-800 hover:text-[#2708ab]"
                    >
                        {message.subject || "Sem assunto"}
                    </button>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{message.message}</p>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={statusInfo.className}>
                        {statusInfo.label}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(message.createdAt)}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenChange(true)} title="Ver mensagem">
                            <Eye className="size-4" />
                        </Button>
                        {message.status !== "read" && (
                            <Button size="sm" variant="ghost" onClick={() => setStatus("read")} title="Marcar como lida">
                                <MailOpen className="size-4" />
                            </Button>
                        )}
                        {message.status !== "unread" && (
                            <Button size="sm" variant="ghost" onClick={() => setStatus("unread")} title="Marcar como não lida">
                                <Mail className="size-4" />
                            </Button>
                        )}
                        {message.status !== "replied" && (
                            <Button size="sm" variant="ghost" onClick={() => setStatus("replied")} title="Marcar como respondida">
                                <CheckCheck className="size-4" />
                            </Button>
                        )}
                        <ConfirmDialog
                            title="Remover mensagem"
                            subtitle="Tem certeza que deseja remover esta mensagem? Esta ação não pode ser desfeita."
                            onClick={handleDelete}
                        >
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" title="Remover">
                                <Trash2 className="size-4" />
                            </Button>
                        </ConfirmDialog>
                    </div>
                </TableCell>
            </TableRow>

            <Sheet open={open} onOpenChange={handleOpenChange}>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{message.subject || "Sem assunto"}</SheetTitle>
                        <SheetDescription>
                            {message.name} · {message.email} · {formatDate(message.createdAt)}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-4">
                        <div className="mb-4">
                            <Badge variant="outline" className={statusInfo.className}>
                                {statusInfo.label}
                            </Badge>
                        </div>
                        <div className="whitespace-pre-wrap rounded-md border bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                            {message.message}
                        </div>
                        <div className="mt-4 rounded-md border bg-white p-4 text-sm text-slate-700">
                            <p className="text-xs font-semibold uppercase text-slate-400">IP</p>
                            <p className="mt-1 break-all">{message.ipAddress || "Nao identificado"}</p>
                        </div>
                    </div>

                    <SheetFooter>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Contato DCE"}`)}`}>
                                    <Reply className="size-4" />
                                    Responder por email
                                </a>
                            </Button>
                            <Button variant="outline" onClick={() => setStatus("replied")}>
                                <CheckCheck className="size-4" />
                                Marcar respondida
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
