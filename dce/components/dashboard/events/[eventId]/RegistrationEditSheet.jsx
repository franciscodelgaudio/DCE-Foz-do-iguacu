'use client'

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { updateRegistration } from "@/lib/actions/eventRegistration"

function formatAnswerValue(value) {
    if (value === true) return "true"
    if (value === false) return "false"
    return String(value ?? "")
}

function parseAnswerValue(originalValue, value) {
    if (typeof originalValue === "boolean") return value === "true"
    return value
}

export function RegistrationEditSheet({ registration }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const initialAnswers = useMemo(() => registration.answers ?? [], [registration.answers])
    const [answers, setAnswers] = useState(() =>
        initialAnswers.map((answer) => ({ ...answer, value: formatAnswerValue(answer.value) }))
    )
    const [saving, setSaving] = useState(false)

    function updateAnswer(index, value) {
        setAnswers((current) => current.map((answer, i) => (i === index ? { ...answer, value } : answer)))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)

        const payload = answers.map((answer, index) => ({
            key: answer.key,
            label: answer.label,
            value: parseAnswerValue(initialAnswers[index]?.value, answer.value),
        }))

        const result = await updateRegistration(String(registration._id), payload)
        setSaving(false)

        if (!result.success) {
            toast.error(result.message)
            return
        }

        toast.success(result.message)
        setOpen(false)
        router.refresh()
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                    <Pencil className="size-4" />
                </button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Editar {registration.registrationNumber}</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
                    {answers.map((answer, index) => (
                        <label key={`${answer.key}-${index}`} className="block">
                            <span className="text-xs font-semibold uppercase text-slate-500">
                                {answer.label || answer.key || `Campo ${index + 1}`}
                            </span>
                            {typeof initialAnswers[index]?.value === "boolean" ? (
                                <select
                                    value={answer.value}
                                    onChange={(event) => updateAnswer(index, event.target.value)}
                                    className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="true">Sim</option>
                                    <option value="false">Nao</option>
                                </select>
                            ) : (
                                <Input
                                    value={answer.value}
                                    onChange={(event) => updateAnswer(index, event.target.value)}
                                    className="mt-1"
                                />
                            )}
                        </label>
                    ))}

                    <Button type="submit" disabled={saving} className="w-full">
                        {saving ? "Salvando..." : "Salvar alteracoes"}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
