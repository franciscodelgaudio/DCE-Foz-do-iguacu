'use client'

import { useEffect, useState } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitRegistration } from "@/lib/actions/eventRegistration"
import { CheckCircle2, Copy } from "lucide-react"

const ACADEMIC_EMAIL_KEY = "academicEmail"
const ACADEMIC_EMAIL_DOMAIN = "@unioeste.br"

function normalizeAcademicEmailPrefix(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/@unioeste\.br$/i, "")
}

function isValidAcademicEmailPrefix(value) {
    return /^[^\s@]+$/.test(value)
}

const PIX_TYPE_LABELS = {
    email: "E-mail",
    phone: "Telefone",
    cpf: "CPF / CNPJ",
    random: "Chave Aleatoria",
}

function SuccessState({ registrationNumber, event }) {
    const { requiresPayment, paymentAmount, pixKey, pixKeyType, pixRecipientName } = event.registration
    const [copied, setCopied] = useState(false)

    function copyPix() {
        if (!pixKey) return
        navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="mx-auto max-w-md space-y-6 py-10 text-center">
            <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
            </div>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-800">Inscricao realizada!</h2>
                <p className="text-slate-500">Guarde seu numero de inscricao.</p>
            </div>
            <div className="rounded-xl border bg-slate-50 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Numero da inscricao</p>
                <p className="mt-1 text-3xl font-extrabold tracking-widest text-[#2708ab]">{registrationNumber}</p>
            </div>

            {requiresPayment && pixKey && (
                <div className="space-y-3 rounded-xl border bg-white p-5 text-left">
                    <p className="font-semibold text-slate-800">Pagamento via PIX</p>
                    <p className="text-sm text-slate-600">
                        Envie{" "}
                        <span className="font-semibold text-slate-800">
                            R$ {Number(paymentAmount ?? 0).toFixed(2).replace(".", ",")}
                        </span>{" "}
                        para a chave abaixo e aguarde a confirmacao:
                    </p>
                    <div className="space-y-1 rounded-lg border bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">{PIX_TYPE_LABELS[pixKeyType] ?? "Chave"}</p>
                        <div className="flex items-center justify-between gap-2">
                            <p className="break-all font-mono text-sm font-semibold text-slate-800">{pixKey}</p>
                            <button
                                type="button"
                                onClick={copyPix}
                                className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            >
                                <Copy className="size-4" />
                            </button>
                        </div>
                        {pixRecipientName && (
                            <p className="text-xs text-slate-500">Favorecido: {pixRecipientName}</p>
                        )}
                    </div>
                    {copied && <p className="text-xs text-emerald-600">Chave PIX copiada!</p>}
                    <p className="text-xs text-slate-400">
                        Apos o pagamento, sua inscricao sera confirmada pela organizacao.
                    </p>
                </div>
            )}
        </div>
    )
}

export function RegistrationForm({ event }) {
    const { formFields = [], requiresPayment, paymentAmount, deadline, limit } = event.registration ?? {}
    const [answers, setAnswers] = useState({})
    const [academicEmail, setAcademicEmail] = useState("")
    const [turnstileToken, setTurnstileToken] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [successNumber, setSuccessNumber] = useState(null)
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    const deadlinePassed = deadline && new Date(deadline) < new Date()

    useEffect(() => {
        window.onEventRegistrationTurnstileSuccess = (token) => {
            setTurnstileToken(token)
        }
        window.onEventRegistrationTurnstileExpired = () => {
            setTurnstileToken("")
        }

        return () => {
            delete window.onEventRegistrationTurnstileSuccess
            delete window.onEventRegistrationTurnstileExpired
        }
    }, [])

    if (deadlinePassed) {
        return (
            <div className="mx-auto max-w-md rounded-xl border bg-slate-50 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-slate-700">Inscricoes encerradas</p>
                <p className="mt-1 text-sm text-slate-500">
                    O prazo de inscricao para este evento encerrou em{" "}
                    {new Date(deadline).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.
                </p>
            </div>
        )
    }

    if (successNumber) {
        return <SuccessState registrationNumber={successNumber} event={event} />
    }

    function handleChange(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        const academicEmailPrefix = normalizeAcademicEmailPrefix(academicEmail)
        if (!isValidAcademicEmailPrefix(academicEmailPrefix)) {
            setError(`Digite apenas a parte antes de ${ACADEMIC_EMAIL_DOMAIN}.`)
            return
        }

        const normalizedAcademicEmail = `${academicEmailPrefix}${ACADEMIC_EMAIL_DOMAIN}`
        setAcademicEmail(academicEmailPrefix)

        const formattedAnswers = [
            {
                key: ACADEMIC_EMAIL_KEY,
                label: "E-mail academico",
                value: normalizedAcademicEmail,
            },
            ...formFields.map((f) => ({
                key: f.key,
                label: f.label,
                value: answers[f.key] ?? (f.type === "checkbox" ? false : ""),
            })),
        ]

        setSubmitting(true)
        const result = await submitRegistration(String(event._id), formattedAnswers, turnstileToken)
        setSubmitting(false)
        window.turnstile?.reset()
        setTurnstileToken("")

        if (!result.success) {
            setError(result.message)
            return
        }

        setSuccessNumber(result.registrationNumber)
    }

    return (
        <div className="mx-auto max-w-lg space-y-6 py-6">
            {turnstileSiteKey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="afterInteractive"
                />
            )}

            <div>
                <h2 className="text-2xl font-bold text-[#2708ab]">Inscricao</h2>
                <p className="mt-1 text-sm text-slate-500">{event.title}</p>
                {limit && (
                    <p className="mt-1 text-xs text-slate-400">
                        Vagas limitadas, inscreva-se logo.
                    </p>
                )}
                {deadline && !deadlinePassed && (
                    <p className="mt-1 text-xs text-slate-400">
                        Prazo:{" "}
                        {new Date(deadline).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                )}
            </div>

            {requiresPayment && paymentAmount && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-semibold text-amber-800">
                        Evento pago, R$ {Number(paymentAmount).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600">
                        As instrucoes de pagamento aparecerao apos a inscricao.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label>
                        E-mail academico
                        <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <div className="flex min-w-0">
                        <Input
                            type="text"
                            required
                            inputMode="email"
                            autoComplete="username"
                            placeholder="seu.nome"
                            value={academicEmail}
                            onChange={(e) => setAcademicEmail(normalizeAcademicEmailPrefix(e.target.value))}
                            className="rounded-r-none"
                        />
                        <span className="flex h-9 shrink-0 items-center rounded-r-md border border-l-0 border-input bg-slate-50 px-3 text-sm font-medium text-slate-600">
                            {ACADEMIC_EMAIL_DOMAIN}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Digite apenas o que vem antes de {ACADEMIC_EMAIL_DOMAIN}.
                    </p>
                </div>

                {formFields.length === 0 && (
                    <p className="text-sm text-slate-500">
                        Preencha e confirme sua inscricao abaixo.
                    </p>
                )}

                {formFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                        <Label>
                            {field.label}
                            {field.required && <span className="ml-1 text-red-500">*</span>}
                        </Label>

                        {field.type === "textarea" ? (
                            <textarea
                                required={field.required}
                                value={answers[field.key] ?? ""}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                rows={3}
                                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        ) : field.type === "select" ? (
                            <select
                                required={field.required}
                                value={answers[field.key] ?? ""}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">Selecione...</option>
                                {(field.options ?? []).map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : field.type === "checkbox" ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={field.key}
                                    checked={answers[field.key] ?? false}
                                    onChange={(e) => handleChange(field.key, e.target.checked)}
                                    className="size-4 accent-[#2708ab]"
                                />
                                <label htmlFor={field.key} className="text-sm text-slate-700">Sim</label>
                            </div>
                        ) : (
                            <Input
                                type={field.type}
                                required={field.required}
                                value={answers[field.key] ?? ""}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                {turnstileSiteKey && (
                    <div
                        className="cf-turnstile"
                        data-sitekey={turnstileSiteKey}
                        data-callback="onEventRegistrationTurnstileSuccess"
                        data-expired-callback="onEventRegistrationTurnstileExpired"
                        data-theme="light"
                    />
                )}

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <Button type="submit" disabled={submitting} className="w-full bg-[#2708ab] hover:bg-[#2708ab]/90">
                    {submitting ? "Enviando..." : "Confirmar inscricao"}
                </Button>
            </form>
        </div>
    )
}
