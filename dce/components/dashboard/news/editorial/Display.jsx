import { LayoutList, Users } from "lucide-react"
import { slotPeriodLabel } from "@/lib/editorial"

function SlotStatusBadge({ filled, past, count, assignedPublished }) {
    if (filled) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            ✅ Preenchido
        </span>
    )
    if (past && count === 0) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            ⚠️ Vazio
        </span>
    )
    if (past) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            ⚠️ Incompleto
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            ⬜ Aguardando
        </span>
    )
}

function CoordStatusBadge({ done, goal }) {
    if (done >= goal) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Cumprida
        </span>
    )
    if (done > 0) return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            Parcial
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Pendente
        </span>
    )
}

function ProgressDots({ done, goal }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: goal }).map((_, i) => (
                <span
                    key={i}
                    className={`inline-block size-3 rounded-full ${i < done ? "bg-[#2708ab]" : "bg-gray-200"}`}
                />
            ))}
        </div>
    )
}

export function Display({ slots, coordStats, today }) {
    const todayDate = new Date(today)

    return (
        <div>
            {/* Header */}
            <div className="border-b bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                        <LayoutList className="size-5 text-[#2708ab]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Controle Editorial</h1>
                        <p className="text-sm text-muted-foreground">
                            Calendário de publicações e obrigações das coordenações — 2.º semestre 2026
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8 p-6">
                {/* Calendário editorial */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <LayoutList className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-semibold text-gray-800">Calendário Editorial</h2>
                        <span className="text-xs text-muted-foreground">
                            — 2 publicações por slot, pela coordenação da vez
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-medium text-gray-600">Slot</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Período</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Responsável da vez</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Publicações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {slots.map((slot) => {
                                    const endDate = new Date(slot.end + "T23:59:59")
                                    const isPast = endDate < todayDate
                                    const isCurrent = new Date(slot.start + "T00:00:00") <= todayDate && todayDate <= endDate

                                    return (
                                        <tr
                                            key={slot.label}
                                            className={isCurrent ? "bg-blue-50/60" : ""}
                                        >
                                            <td className="px-4 py-3 font-mono font-medium text-gray-900">
                                                {slot.label}
                                                {isCurrent && (
                                                    <span className="ml-2 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                                        atual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {slotPeriodLabel(slot)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-gray-800 font-medium text-sm">{slot.assignedLabel}</span>
                                                {slot.assignedPublished
                                                    ? <span className="ml-1.5 text-xs text-green-600 font-medium">✓ publicou</span>
                                                    : <span className="ml-1.5 text-xs text-gray-400">pendente</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <SlotStatusBadge
                                                    filled={slot.filled}
                                                    past={isPast}
                                                    count={slot.count}
                                                    assignedPublished={slot.assignedPublished}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-700">
                                                {slot.count > 0 ? `${slot.count}/2` : "—"}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Um slot é preenchido quando tem 2 ou mais publicações <em>e</em> a coordenação responsável da vez publicou.
                        Slots passados incompletos ficam em amarelo; sem nenhuma publicação, em vermelho.
                    </p>
                </section>

                {/* Obrigações das coordenações */}
                <section>
                    <div className="mb-3 flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <h2 className="text-base font-semibold text-gray-800">Obrigações das Coordenações</h2>
                        <span className="text-xs text-muted-foreground">
                            — meta de publicações por semestre
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-medium text-gray-600">Coordenação</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Meta</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Realizadas</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Progresso</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {coordStats.map((coord) => (
                                    <tr key={coord.key}>
                                        <td className="px-4 py-3 font-medium text-gray-900">{coord.label}</td>
                                        <td className="px-4 py-3 text-center text-gray-700">{coord.goal}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-900">{coord.done}</td>
                                        <td className="px-4 py-3">
                                            <ProgressDots done={coord.done} goal={coord.goal} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <CoordStatusBadge done={coord.done} goal={coord.goal} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                        Publicações antecipadas contam para a meta da coordenação, mas não preenchem automaticamente slots futuros.
                    </p>
                </section>
            </div>
        </div>
    )
}
