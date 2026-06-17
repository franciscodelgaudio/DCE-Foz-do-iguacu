'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { getRegistrationStudent } from "@/components/dashboard/events/registrationUtils"

const PAYMENT_LABELS = {
    not_required: "Confirmada",
    pending: "Aguardando",
    confirmed: "Pago",
    cancelled: "Cancelada",
}

function buildRows(registrations, event) {
    const requiresPayment = event.registration?.requiresPayment ?? false
    const formFields = event.registration?.formFields ?? []

    return registrations.map((reg) => {
        const { name, ra } = getRegistrationStudent(reg)

        const row = {
            "Nº Inscrição": reg.registrationNumber ?? "",
            "Nome": name,
            "RA": ra,
            "Email": reg.academicEmail ?? "",
            "Data de inscrição": new Date(reg.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        }

        if (requiresPayment) {
            row["Pagamento"] = PAYMENT_LABELS[reg.paymentStatus] ?? reg.paymentStatus
        }

        row["Presente"] = reg.entryConfirmedAt ? "Sim" : "Não"
        row["Data de entrada"] = reg.entryConfirmedAt
            ? new Date(reg.entryConfirmedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
            : ""

        for (const field of formFields) {
            const answer = reg.answers?.find((a) => a.key === field.key)
            const value = answer?.value
            row[field.label] =
                value === true ? "Sim" : value === false ? "Não" : (value != null ? String(value) : "")
        }

        return row
    })
}

async function downloadXLSX(rows, eventTitle) {
    const { utils, writeFile } = await import("xlsx")
    const ws = utils.json_to_sheet(rows)

    // Auto-size columns
    const colWidths = Object.keys(rows[0] ?? {}).map((key) => {
        const maxLen = Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length))
        return { wch: Math.min(maxLen + 2, 50) }
    })
    ws["!cols"] = colWidths

    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Inscrições")
    const filename = `inscricoes-${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx`
    writeFile(wb, filename)
}

async function downloadPDF(rows, eventTitle) {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })

    doc.setFontSize(14)
    doc.setTextColor(39, 8, 171)
    doc.text(`Inscrições — ${eventTitle}`, 14, 14)

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(
        `Exportado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} · ${rows.length} inscrição(ões)`,
        14,
        21
    )

    if (rows.length === 0) {
        doc.setFontSize(11)
        doc.setTextColor(60, 60, 60)
        doc.text("Nenhum inscrito corresponde aos filtros selecionados.", 14, 35)
    } else {
        const headers = Object.keys(rows[0])
        const body = rows.map((row) => headers.map((h) => String(row[h] ?? "")))

        autoTable(doc, {
            startY: 26,
            head: [headers],
            body,
            styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak" },
            headStyles: {
                fillColor: [39, 8, 171],
                textColor: 255,
                fontStyle: "bold",
                fontSize: 8,
            },
            alternateRowStyles: { fillColor: [247, 248, 252] },
            margin: { left: 14, right: 14 },
        })
    }

    const filename = `inscricoes-${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`
    doc.save(filename)
}

export function ExportSheet({ registrations, event }) {
    const [open, setOpen] = useState(false)
    const [format, setFormat] = useState("xlsx")
    const [presenceFilter, setPresenceFilter] = useState("all")
    const [fieldFilters, setFieldFilters] = useState({})
    const [loading, setLoading] = useState(false)

    const formFields = event.registration?.formFields ?? []

    // Unique values per custom field, from the passed (already-filtered) registrations
    const fieldValues = useMemo(() => {
        const result = {}
        for (const field of formFields) {
            const values = new Set()
            for (const reg of registrations) {
                const answer = reg.answers?.find((a) => a.key === field.key)
                const v = answer?.value
                if (v != null && v !== "") {
                    values.add(v === true ? "Sim" : v === false ? "Não" : String(v))
                }
            }
            result[field.key] = [...values].sort()
        }
        return result
    }, [registrations, formFields])

    const exportData = useMemo(() => {
        return registrations.filter((reg) => {
            if (presenceFilter === "present" && !reg.entryConfirmedAt) return false
            if (presenceFilter === "absent" && reg.entryConfirmedAt) return false

            for (const [fieldKey, filterValue] of Object.entries(fieldFilters)) {
                if (!filterValue) continue
                const answer = reg.answers?.find((a) => a.key === fieldKey)
                const v = answer?.value
                const str = v === true ? "Sim" : v === false ? "Não" : String(v ?? "")
                if (str !== filterValue) return false
            }

            return true
        })
    }, [registrations, presenceFilter, fieldFilters])

    function resetFilters() {
        setPresenceFilter("all")
        setFieldFilters({})
    }

    async function handleExport() {
        setLoading(true)
        try {
            const rows = buildRows(exportData, event)
            if (format === "xlsx") {
                await downloadXLSX(rows, event.title)
            } else {
                await downloadPDF(rows, event.title)
            }
            setOpen(false)
        } finally {
            setLoading(false)
        }
    }

    const activeFilterCount =
        (presenceFilter !== "all" ? 1 : 0) +
        Object.values(fieldFilters).filter(Boolean).length

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="size-4" />
                    Exportar
                    {activeFilterCount > 0 && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-[#2708ab] text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
                <SheetHeader>
                    <SheetTitle>Exportar inscrições</SheetTitle>
                    <p className="text-sm text-slate-500">
                        Baseado nos {registrations.length} inscritos exibidos atualmente.
                    </p>
                </SheetHeader>

                <div className="flex flex-col gap-5 px-4 pb-2">
                    {/* Format selector */}
                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">Formato</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormat("xlsx")}
                                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                                    format === "xlsx"
                                        ? "border-[#2708ab] bg-[#2708ab]/5 text-[#2708ab] font-medium"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <FileSpreadsheet className="size-4 shrink-0" />
                                Excel (.xlsx)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormat("pdf")}
                                className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                                    format === "pdf"
                                        ? "border-[#2708ab] bg-[#2708ab]/5 text-[#2708ab] font-medium"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                <FileText className="size-4 shrink-0" />
                                PDF (.pdf)
                            </button>
                        </div>
                    </div>

                    {/* Presence filter */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Presença
                        </label>
                        <select
                            value={presenceFilter}
                            onChange={(e) => setPresenceFilter(e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="all">Todos os inscritos</option>
                            <option value="present">Somente presentes</option>
                            <option value="absent">Somente ausentes</option>
                        </select>
                    </div>

                    {/* Custom field filters */}
                    {formFields.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">Filtrar por campo</p>
                            {formFields.map((field) => {
                                const values = fieldValues[field.key] ?? []
                                if (values.length === 0) return null
                                return (
                                    <div key={field.key}>
                                        <label className="mb-1 block text-xs font-medium text-slate-500">
                                            {field.label}
                                        </label>
                                        <select
                                            value={fieldFilters[field.key] ?? ""}
                                            onChange={(e) =>
                                                setFieldFilters((prev) => ({
                                                    ...prev,
                                                    [field.key]: e.target.value,
                                                }))
                                            }
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            <option value="">Todos</option>
                                            {values.map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Result count */}
                    <div className="rounded-lg border bg-slate-50 px-3 py-2.5">
                        <p className="text-sm text-slate-700">
                            <span className="font-bold text-[#2708ab]">{exportData.length}</span>{" "}
                            inscrição(ões) serão exportadas
                        </p>
                    </div>
                </div>

                <SheetFooter className="flex-col gap-2 px-4">
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-sm text-slate-500 underline-offset-2 hover:underline"
                        >
                            Limpar filtros
                        </button>
                    )}
                    <Button
                        onClick={handleExport}
                        disabled={loading || exportData.length === 0}
                        className="w-full"
                    >
                        <Download className="size-4" />
                        {loading ? "Gerando arquivo..." : `Baixar ${format.toUpperCase()}`}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
