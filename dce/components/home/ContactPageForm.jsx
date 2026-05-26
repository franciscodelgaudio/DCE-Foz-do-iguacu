'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendContactMessage } from "@/lib/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    subject: z.string().min(1, "Assunto é obrigatório"),
    message: z.string().min(10, "Mensagem deve ter ao menos 10 caracteres"),
})

export function ContactPageForm() {
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) })

    const onSubmit = async (data) => {
        setLoading(true)
        const result = await sendContactMessage(data)
        setLoading(false)
        if (result.success) {
            toast.success(result.message)
            reset()
        } else {
            toast.error(result.message)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cf-name" className="text-sm font-semibold text-[#2708ab]">Nome *</Label>
                    <Input
                        id="cf-name"
                        placeholder="Seu nome completo"
                        {...register("name")}
                        className={errors.name ? "border-red-400" : ""}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cf-email" className="text-sm font-semibold text-[#2708ab]">E-mail *</Label>
                    <Input
                        id="cf-email"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email")}
                        className={errors.email ? "border-red-400" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cf-subject" className="text-sm font-semibold text-[#2708ab]">Assunto *</Label>
                <Input
                    id="cf-subject"
                    placeholder="Sobre o que você quer falar?"
                    {...register("subject")}
                    className={errors.subject ? "border-red-400" : ""}
                />
                {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cf-message" className="text-sm font-semibold text-[#2708ab]">Mensagem *</Label>
                <textarea
                    id="cf-message"
                    rows={6}
                    placeholder="Escreva sua mensagem aqui..."
                    {...register("message")}
                    className={[
                        "w-full resize-none rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#2708ab] focus:ring-1 focus:ring-[#2708ab]",
                        errors.message ? "border-red-400" : "border-input",
                    ].join(" ")}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">* Campos obrigatórios</p>
                <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 rounded-xl border-4 border-[#2708ab] bg-[#2708ab] px-6 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_#fdf25a] transition-all hover:bg-[#1a0580] hover:shadow-[6px_6px_0_#fdf25a] disabled:opacity-60"
                >
                    <Send className="h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar mensagem"}
                </Button>
            </div>
        </form>
    )
}
