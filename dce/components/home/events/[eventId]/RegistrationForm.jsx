'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestRegistrationCode, submitRegistration } from "@/lib/actions/eventRegistration"
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
    random: "Chave Aleatória",
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
                <h2 className="text-2xl font-bold text-slate-800">Inscrição realizada!</h2>
                <p className="text-slate-500">Guarde seu número de inscrição.</p>
            </div>
            <div className="rounded-xl border bg-slate-50 px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nº da inscrição</p>
                <p className="mt-1 text-3xl font-extrabold tracking-widest text-[#2708ab]">{registrationNumber}</p>
            </div>

            {requiresPayment && pixKey && (
                <div className="rounded-xl border bg-white p-5 text-left space-y-3">
                    <p className="font-semibold text-slate-800">Pagamento via PIX</p>
                    <p className="text-sm text-slate-600">
                        Envie{" "}
                        <span className="font-semibold text-slate-800">
                            R$ {Number(paymentAmount ?? 0).toFixed(2).replace(".", ",")}
                        </span>{" "}
                        para a chave abaixo e aguarde a confirmação:
                    </p>
                    <div className="rounded-lg border bg-slate-50 p-3 space-y-1">
                        <p className="text-xs text-slate-400">{PIX_TYPE_LABELS[pixKeyType] ?? "Chave"}</p>
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-sm font-semibold text-slate-800 break-all">{pixKey}</p>
                            <button
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
                        Após o pagamento, sua inscrição será confirmada pela organização.
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
    const [verificationCode, setVerificationCode] = useState("")
    const [codeSent, setCodeSent] = useState(false)
    const [verificationStep, setVerificationStep] = useState(false)
    const [sendingCode, setSendingCode] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [notice, setNotice] = useState(null)
    const [successNumber, setSuccessNumber] = useState(null)

    const deadlinePassed = deadline && new Date(deadline) < new Date()

    if (deadlinePassed) {
        return (
            <div className="mx-auto max-w-md rounded-xl border bg-slate-50 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-slate-700">Inscrições encerradas</p>
                <p className="mt-1 text-sm text-slate-500">
                    O prazo de inscrição para este evento encerrou em{" "}
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

    function handleContinueToVerification() {
        setError(null)
        setNotice(null)

        const academicEmailPrefix = normalizeAcademicEmailPrefix(academicEmail)
        if (!isValidAcademicEmailPrefix(academicEmailPrefix)) {
            setError(`Digite apenas a parte antes de ${ACADEMIC_EMAIL_DOMAIN}.`)
            return
        }

        setAcademicEmail(academicEmailPrefix)
        setVerificationCode("")
        setCodeSent(false)
        setVerificationStep(true)
    }

    async function handleSendCode() {
        setError(null)
        setNotice(null)

        const academicEmailPrefix = normalizeAcademicEmailPrefix(academicEmail)
        if (!isValidAcademicEmailPrefix(academicEmailPrefix)) {
            setError(`Digite apenas a parte antes de ${ACADEMIC_EMAIL_DOMAIN}.`)
            return
        }

        const normalizedAcademicEmail = `${academicEmailPrefix}${ACADEMIC_EMAIL_DOMAIN}`
        setAcademicEmail(academicEmailPrefix)

        setSendingCode(true)
        const result = await requestRegistrationCode(String(event._id), normalizedAcademicEmail)
        setSendingCode(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setCodeSent(true)
        setNotice(result.message)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)
        setNotice(null)

        const academicEmailPrefix = normalizeAcademicEmailPrefix(academicEmail)
        if (!isValidAcademicEmailPrefix(academicEmailPrefix)) {
            setError(`Digite apenas a parte antes de ${ACADEMIC_EMAIL_DOMAIN}.`)
            return
        }

        const normalizedAcademicEmail = `${academicEmailPrefix}${ACADEMIC_EMAIL_DOMAIN}`
        setAcademicEmail(academicEmailPrefix)

        const cleanVerificationCode = verificationCode.replace(/\D/g, "")
        if (!/^\d{6}$/.test(cleanVerificationCode)) {
            setError("Informe o codigo de 6 digitos enviado ao seu e-mail.")
            return
        }

        setSubmitting(true)

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

        const result = await submitRegistration(String(event._id), formattedAnswers, cleanVerificationCode)
        setSubmitting(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setSuccessNumber(result.registrationNumber)
    }

    if (!verificationStep) {
        return (
            <div className="mx-auto max-w-lg space-y-6 py-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#2708ab]">Inscrição</h2>
                    <p className="mt-1 text-sm text-slate-500">{event.title}</p>
                    {limit && (
                        <p className="mt-1 text-xs text-slate-400">
                            Vagas limitadas — inscreva-se logo.
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
                            Evento pago — R$ {Number(paymentAmount).toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            As instruções de pagamento aparecerão após a inscrição.
                        </p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleContinueToVerification()
                    }}
                    className="space-y-4"
                >
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
                                onChange={(e) => {
                                    setAcademicEmail(normalizeAcademicEmailPrefix(e.target.value))
                                    setVerificationCode("")
                                    setNotice(null)
                                }}
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

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <Button type="submit" className="w-full bg-[#2708ab] hover:bg-[#2708ab]/90">
                        Continuar
                    </Button>
                </form>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-lg space-y-6 py-6">
            <div>
                <h2 className="text-2xl font-bold text-[#2708ab]">Inscrição</h2>
                <p className="mt-1 text-sm text-slate-500">{event.title}</p>
                {limit && (
                    <p className="mt-1 text-xs text-slate-400">
                        Vagas limitadas — inscreva-se logo.
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
                        Evento pago — R$ {Number(paymentAmount).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                        As instruções de pagamento aparecerão após a inscrição.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg border bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">E-mail academico</p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="break-all text-sm font-semibold text-slate-800">
                            {`${normalizeAcademicEmailPrefix(academicEmail)}${ACADEMIC_EMAIL_DOMAIN}`}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setVerificationStep(false)
                                setCodeSent(false)
                                setVerificationCode("")
                                setNotice(null)
                                setError(null)
                            }}
                            className="text-sm font-medium text-[#2708ab] hover:underline"
                        >
                            Alterar
                        </button>
                    </div>
                </div>

                {!codeSent ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-sm font-medium text-blue-900">
                            Envie um codigo para validar seu e-mail academico.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendCode}
                            disabled={sendingCode || submitting}
                            className="mt-3 w-full border-blue-200 bg-white text-blue-900 hover:bg-blue-100"
                        >
                            {sendingCode ? "Enviando codigo..." : "Enviar codigo"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <Label>
                            Codigo de verificacao
                            <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                required
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendCode}
                                disabled={sendingCode || submitting}
                                className="w-full shrink-0 sm:w-auto"
                            >
                                {sendingCode ? "Enviando..." : "Reenviar codigo"}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            O codigo enviado por e-mail expira em 15 minutos.
                        </p>
                    </div>
                )}

                {formFields.length === 0 && (
                    <p className="text-sm text-slate-500">
                        Preencha e confirme sua inscrição abaixo.
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
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
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

                {notice && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                        {notice}
                    </p>
                )}

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <Button type="submit" disabled={submitting || !codeSent} className="w-full bg-[#2708ab] hover:bg-[#2708ab]/90">
                    {submitting ? "Enviando..." : "Confirmar inscrição"}
                </Button>
            </form>
        </div>
    )
}
