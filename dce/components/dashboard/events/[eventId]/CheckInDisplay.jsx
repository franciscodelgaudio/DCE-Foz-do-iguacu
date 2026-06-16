'use client'

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle2, Search, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { confirmRegistrationEntry } from "@/lib/actions/eventRegistration"
import {
    getRegistrationStudent,
    registrationMatchesSearch,
} from "@/components/dashboard/events/registrationUtils"

function CheckInRow({ registration }) {
    const router = useRouter()
    const { name, ra } = getRegistrationStudent(registration)
    const checkedIn = Boolean(registration.entryConfirmedAt)

    async function handleConfirmEntry() {
        const result = await confirmRegistrationEntry(String(registration._id))
        if (result.success) {
            toast.success(result.message)
            router.refresh()
            return
        }

        toast.error(result.message)
    }

    return (
        <div className={[
            "rounded-lg border bg-white p-4 shadow-sm transition-colors",
            checkedIn ? "border-emerald-200 bg-emerald-50/50" : "",
        ].join(" ")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="break-words text-base font-semibold leading-snug text-slate-900">{name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                        <span className="font-medium">{ra}</span>
                        <span className="font-mono text-xs text-slate-400">{registration.registrationNumber}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                    {checkedIn ? (
                        <>
                            <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                                <UserCheck className="size-3" />
                                Entrada confirmada
                            </Badge>
                            <p className="text-xs text-emerald-700">
                                {new Date(registration.entryConfirmedAt).toLocaleString("pt-BR")}
                            </p>
                        </>
                    ) : (
                        <ConfirmDialog
                            title="Confirmar entrada"
                            subtitle={`Confirmar a entrada de ${name} (${ra})?`}
                            onClick={handleConfirmEntry}
                        >
                            <Button className="w-full sm:w-auto">
                                <CheckCircle2 className="size-4" />
                                Confirmar entrada
                            </Button>
                        </ConfirmDialog>
                    )}
                </div>
            </div>
        </div>
    )
}

export function CheckInDisplay({ registrations, event }) {
    const [search, setSearch] = useState("")

    const filtered = useMemo(() => {
        return registrations.filter((registration) => registrationMatchesSearch(registration, search))
    }, [registrations, search])

    const checkedInCount = useMemo(() => {
        return registrations.filter((registration) => registration.entryConfirmedAt).length
    }, [registrations])

    return (
        <div>
            <div className="border-b bg-white px-4 py-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href={`/dashboard/events/${event._id}/registrations`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        <UserCheck className="size-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-gray-900">Controle de entrada</h1>
                        <p className="truncate text-sm text-muted-foreground">{event.title}</p>
                    </div>
                </div>
            </div>

            <div className="border-b bg-gray-50/60 px-4 py-4 sm:px-6">
                <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                    <div className="rounded-lg border bg-white p-3">
                        <p className="text-2xl font-extrabold text-slate-800">{registrations.length}</p>
                        <p className="text-xs text-slate-500">Inscritos</p>
                    </div>
                    <div className="rounded-lg border bg-white p-3">
                        <p className="text-2xl font-extrabold text-emerald-700">{checkedInCount}</p>
                        <p className="text-xs text-slate-500">Entradas confirmadas</p>
                    </div>
                </div>
            </div>

            <div className="border-b bg-gray-50/60 px-4 py-3 sm:px-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, RA ou inscricao..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-6">
                {filtered.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-white py-14 text-center text-sm text-muted-foreground">
                        Nenhum inscrito encontrado.
                    </div>
                ) : (
                    filtered.map((registration) => (
                        <CheckInRow key={registration._id} registration={registration} />
                    ))
                )}
            </div>
        </div>
    )
}
