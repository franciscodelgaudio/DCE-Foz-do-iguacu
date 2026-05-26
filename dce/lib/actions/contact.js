'use server'

import { z } from "zod"
import { Contact } from "@/models/contact"

const contactSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    subject: z.string().min(1, "Assunto é obrigatório"),
    message: z.string().min(10, "Mensagem deve ter ao menos 10 caracteres"),
})

export async function sendContactMessage(form) {
    const parsed = contactSchema.safeParse(form)
    if (!parsed.success) {
        return {
            success: false,
            message: "Verifique os campos e tente novamente.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { name, email, subject, message } = parsed.data

    try {
        await Contact.create({ name, email, subject, message })

        if (process.env.RESEND_API_KEY) {
            try {
                const { Resend } = await import("resend")
                const resend = new Resend(process.env.RESEND_API_KEY)
                await resend.emails.send({
                    from: "DCE UNIOESTE <no-reply@dceunioestefoz.com.br>",
                    to: "foz.dce@unioeste.br",
                    subject: `[Contato] ${subject}`,
                    html: `
                        <h2>Nova mensagem de contato</h2>
                        <p><strong>Nome:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Assunto:</strong> ${subject}</p>
                        <p><strong>Mensagem:</strong></p>
                        <p>${message.replace(/\n/g, "<br>")}</p>
                    `,
                })
            } catch (emailErr) {
                console.error("Erro ao enviar email:", emailErr)
            }
        }

        return { success: true, message: "Mensagem enviada com sucesso! Entraremos em contato em breve." }
    } catch (err) {
        console.error("Erro ao salvar mensagem de contato:", err)
        return { success: false, message: "Erro ao enviar mensagem. Tente novamente." }
    }
}
