'use client'

import { useEffect, useState } from "react"
import Script from "next/script"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { submitInscricaoCargo } from "@/lib/actions/inscricaoCargo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SEMESTRES = [
    "1º semestre",
    "2º semestre",
    "3º semestre",
    "4º semestre",
    "5º semestre",
    "6º semestre",
    "7º semestre",
    "8º semestre",
    "9º semestre ou mais",
]

const schema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    course: z.string().min(2, "Informe seu curso"),
    semester: z.string().min(1, "Selecione seu semestre"),
    cargo: z.string().min(1, "Selecione um cargo de interesse"),
    motivation: z.string().min(30, "Motivação deve ter ao menos 30 caracteres"),
    turnstileToken: z.string().optional(),
    website: z.string().optional(),
})

export function InscricaoCargoForm({ jobs = [] }) {
    const [loading, setLoading] = useState(false)
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) })

    const motivationValue = watch("motivation", "")

    useEffect(() => {
        window.onInscricaoTurnstileSuccess = (token) => {
            setValue("turnstileToken", token, { shouldValidate: true })
        }
        window.onInscricaoTurnstileExpired = () => {
            setValue("turnstileToken", "")
        }

        return () => {
            delete window.onInscricaoTurnstileSuccess
            delete window.onInscricaoTurnstileExpired
        }
    }, [setValue])

    const onSubmit = async (data) => {
        setLoading(true)
        const result = await submitInscricaoCargo(data)
        setLoading(false)
        if (result.success) {
            toast.success(result.message)
            reset()
        } else {
            toast.error(result.message)
        }
        window.turnstile?.reset()
        setValue("turnstileToken", "")
    }

    const selectClass = (hasError) =>
        [
            "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-[#2708ab] focus:ring-1 focus:ring-[#2708ab]",
            hasError ? "border-red-400" : "border-input",
        ].join(" ")

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {turnstileSiteKey && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="afterInteractive"
                />
            )}

            <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                {...register("website")}
            />
            <input type="hidden" {...register("turnstileToken")} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ic-name" className="text-sm font-semibold text-[#2708ab]">Nome completo *</Label>
                    <Input
                        id="ic-name"
                        placeholder="Seu nome completo"
                        {...register("name")}
                        className={errors.name ? "border-red-400" : ""}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ic-email" className="text-sm font-semibold text-[#2708ab]">E-mail *</Label>
                    <Input
                        id="ic-email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                        className={errors.email ? "border-red-400" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ic-course" className="text-sm font-semibold text-[#2708ab]">Curso *</Label>
                    <Input
                        id="ic-course"
                        placeholder="Ex: Ciência da Computação"
                        {...register("course")}
                        className={errors.course ? "border-red-400" : ""}
                    />
                    {errors.course && <p className="text-xs text-red-500">{errors.course.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ic-semester" className="text-sm font-semibold text-[#2708ab]">Semestre atual *</Label>
                    <select
                        id="ic-semester"
                        {...register("semester")}
                        className={selectClass(!!errors.semester)}
                    >
                        <option value="">Selecione seu semestre</option>
                        {SEMESTRES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {errors.semester && <p className="text-xs text-red-500">{errors.semester.message}</p>}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="ic-cargo" className="text-sm font-semibold text-[#2708ab]">Cargo de interesse *</Label>
                {jobs.length === 0 ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                        Nenhum cargo disponível no momento. Acompanhe nossas redes para novidades.
                    </div>
                ) : (
                    <select
                        id="ic-cargo"
                        {...register("cargo")}
                        className={selectClass(!!errors.cargo)}
                    >
                        <option value="">Selecione o cargo desejado</option>
                        {jobs.map((job) => (
                            <option key={job._id} value={job.title}>
                                {job.title}{job.area ? ` — ${job.area}` : ""}
                            </option>
                        ))}
                    </select>
                )}
                {errors.cargo && <p className="text-xs text-red-500">{errors.cargo.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="ic-motivation" className="text-sm font-semibold text-[#2708ab]">
                    Por que você quer participar do DCE? *
                </Label>
                <textarea
                    id="ic-motivation"
                    rows={6}
                    placeholder="Conte um pouco sobre sua motivação, experiências anteriores e o que espera contribuir..."
                    {...register("motivation")}
                    className={[
                        "w-full resize-none rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#2708ab] focus:ring-1 focus:ring-[#2708ab]",
                        errors.motivation ? "border-red-400" : "border-input",
                    ].join(" ")}
                />
                <div className="flex items-start justify-between gap-2">
                    {errors.motivation
                        ? <p className="text-xs text-red-500">{errors.motivation.message}</p>
                        : <span />
                    }
                    <p className="text-xs text-slate-400 shrink-0">{motivationValue?.length ?? 0} caracteres</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">* Campos obrigatórios</p>
                {turnstileSiteKey && (
                    <div
                        className="cf-turnstile"
                        data-sitekey={turnstileSiteKey}
                        data-callback="onInscricaoTurnstileSuccess"
                        data-expired-callback="onInscricaoTurnstileExpired"
                        data-theme="light"
                    />
                )}
                <Button
                    type="submit"
                    disabled={loading || jobs.length === 0}
                    className="gap-2 rounded-xl border-4 border-[#2708ab] bg-[#2708ab] px-6 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_#fdf25a] transition-all hover:bg-[#1a0580] hover:shadow-[6px_6px_0_#fdf25a] disabled:opacity-60"
                >
                    <Send className="h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar inscrição"}
                </Button>
            </div>
        </form>
    )
}
