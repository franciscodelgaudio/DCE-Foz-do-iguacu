'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
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

    return { success: true, message: `Convite criado para ${email}. A pessoa pode fazer login com essa conta Google.` }
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
