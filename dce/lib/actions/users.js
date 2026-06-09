'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { z } from "zod"
import { dbConnect } from "@/lib/mongoose"
import { User } from "@/models/user"

const DEFAULT_ADMIN_EMAIL = "foz.dce@gmail.com"

async function requireAdmin() {
    const session = await auth()
    if (!session) redirect("/login")

    await dbConnect()
    const email = session.user?.email?.toLowerCase()
    if (!email) redirect("/login")

    if (email === DEFAULT_ADMIN_EMAIL) return session

    const dbUser = await User.findOne({ email }).lean()
    if (!dbUser || dbUser.role !== "admin") {
        return { error: "Acesso negado. Apenas administradores podem gerenciar usuários." }
    }

    return session
}

export async function getUsers() {
    const result = await requireAdmin()
    if (result?.error) return { success: false, message: result.error }

    await dbConnect()
    const users = await User.find({}).sort({ createdAt: -1 }).lean()

    return {
        success: true,
        users: users.map((u) => ({
            id: String(u._id),
            email: u.email,
            name: u.name ?? null,
            avatarUrl: u.avatarUrl ?? null,
            role: u.role,
            permissions: u.permissions,
            status: u.status,
            invitedBy: u.invitedBy ?? null,
            invitedAt: u.invitedAt?.toISOString() ?? null,
            lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
            createdAt: u.createdAt?.toISOString() ?? null,
        })),
    }
}

const inviteSchema = z.object({
    email: z.string().email("Email inválido"),
    role: z.enum(["admin", "membro"]),
    permissions: z.object({
        news: z.boolean(),
        events: z.boolean(),
        correioElegante: z.boolean(),
        settings: z.boolean(),
    }).optional(),
})

export async function inviteUser(form) {
    const session = await requireAdmin()
    if (session?.error) return { success: false, message: session.error }

    const parsed = inviteSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos: " + parsed.error.issues[0]?.message }

    const { email, role, permissions } = parsed.data

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return { success: false, message: "Esse email já está cadastrado no sistema." }

    const defaultPerms = { news: true, events: true, correioElegante: true, settings: false }

    await User.create({
        email: email.toLowerCase(),
        role,
        permissions: role === "admin" ? { news: true, events: true, correioElegante: true, settings: true } : (permissions ?? defaultPerms),
        status: "convidado",
        invitedBy: session.user?.email ?? null,
        invitedAt: new Date(),
    })

    if (process.env.RESEND_API_KEY) {
        try {
            const headersList = await headers()
            const host = headersList.get("host") ?? "dceunioestefoz.org"
            const protocol = host.startsWith("localhost") ? "http" : "https"
            const baseUrl = `${protocol}://${host}`
            const loginUrl = `${baseUrl}/login`
            const invitedByName = session.user?.name ?? session.user?.email ?? "Um administrador"

            const { Resend } = await import("resend")
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
                from: "DCE UNIOESTE <no-reply@dceunioestefoz.org>",
                to: email.toLowerCase(),
                subject: "Você foi convidado para o painel do DCE UNIOESTE",
                html: `
                    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;background:#fff;">
                        <div style="text-align:center;margin-bottom:28px;">
                            <img src="https://dceunioestefoz.org/images/home/logo.png" alt="DCE UNIOESTE" style="height:72px;width:auto;" />
                        </div>
                        <h1 style="color:#2708ab;text-align:center;font-size:24px;margin-bottom:8px;">Você foi convidado!</h1>
                        <p style="text-align:center;color:#64748b;margin-bottom:28px;">
                            <strong>${invitedByName}</strong> convidou você para acessar o painel de gerenciamento do DCE UNIOESTE.
                        </p>
                        <div style="background:#f1f5ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin-bottom:24px;">
                            <p style="color:#1e293b;font-size:14px;margin:0 0 8px;">
                                <strong>Email de acesso:</strong> ${email.toLowerCase()}
                            </p>
                            <p style="color:#64748b;font-size:13px;margin:0;">
                                Use exatamente esta conta Google para fazer login.
                            </p>
                        </div>
                        <div style="text-align:center;margin-bottom:28px;">
                            <a href="${loginUrl}" style="display:inline-block;background:#2708ab;color:#fff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 36px;border-radius:8px;">
                                Acessar o painel
                            </a>
                        </div>
                        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-bottom:4px;">
                            Ou copie e cole este link no navegador:
                        </p>
                        <p style="text-align:center;margin-bottom:24px;">
                            <a href="${loginUrl}" style="color:#2708ab;font-size:12px;word-break:break-all;">${loginUrl}</a>
                        </p>
                        <hr style="border:none;border-top:1px solid #f1f5f9;margin-bottom:16px;" />
                        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
                            DCE UNIOESTE — Campus Foz do Iguaçu<br>
                            Este é um email automático, não responda.
                        </p>
                    </div>
                `,
            })
        } catch (emailErr) {
            console.error("[inviteUser] Erro ao enviar email de convite:", emailErr)
        }
    }

    return { success: true, message: `Convite criado para ${email}. Um email de convite foi enviado com o link de acesso.` }
}

const updateSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["admin", "membro"]),
    permissions: z.object({
        news: z.boolean(),
        events: z.boolean(),
        correioElegante: z.boolean(),
        settings: z.boolean(),
    }),
})

export async function updateUserPermissions(form) {
    const session = await requireAdmin()
    if (session?.error) return { success: false, message: session.error }

    const parsed = updateSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    const { userId, role, permissions } = parsed.data

    await dbConnect()
    const user = await User.findById(userId)
    if (!user) return { success: false, message: "Usuário não encontrado." }

    if (user.email === DEFAULT_ADMIN_EMAIL) {
        return { success: false, message: "Não é possível alterar o administrador padrão do sistema." }
    }

    await User.updateOne(
        { _id: userId },
        {
            $set: {
                role,
                permissions: role === "admin" ? { news: true, events: true, correioElegante: true, settings: true } : permissions,
            },
        }
    )

    return { success: true, message: "Permissões atualizadas com sucesso." }
}

export async function suspendUser(userId) {
    const session = await requireAdmin()
    if (session?.error) return { success: false, message: session.error }

    if (!userId) return { success: false, message: "ID inválido." }

    await dbConnect()
    const user = await User.findById(userId)
    if (!user) return { success: false, message: "Usuário não encontrado." }

    if (user.email === DEFAULT_ADMIN_EMAIL) {
        return { success: false, message: "Não é possível suspender o administrador padrão do sistema." }
    }

    const newStatus = user.status === "suspenso" ? "ativo" : "suspenso"
    await User.updateOne({ _id: userId }, { $set: { status: newStatus } })

    return { success: true, message: newStatus === "suspenso" ? "Usuário suspenso." : "Usuário reativado." }
}

export async function deleteUser(userId) {
    const session = await requireAdmin()
    if (session?.error) return { success: false, message: session.error }

    if (!userId) return { success: false, message: "ID inválido." }

    await dbConnect()
    const user = await User.findById(userId)
    if (!user) return { success: false, message: "Usuário não encontrado." }

    if (user.email === DEFAULT_ADMIN_EMAIL) {
        return { success: false, message: "Não é possível remover o administrador padrão do sistema." }
    }

    await User.deleteOne({ _id: userId })
    return { success: true, message: "Usuário removido com sucesso." }
}
