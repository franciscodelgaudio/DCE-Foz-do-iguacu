'use server'

import { z } from "zod"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Settings } from "@/models/settings"

const settingsSchema = z.object({
    pixKey: z.string().optional(),
    pixKeyType: z.enum(["email", "phone", "cpf", "random"]).optional(),
    pixRecipientName: z.string().optional(),
    correioEleganteEnabled: z.boolean().optional(),
    correioEleganteStock: z.object({
        cartinha: z.coerce.number().int().min(0).optional(),
        rosa: z.coerce.number().int().min(0).optional(),
        bombom: z.coerce.number().int().min(0).optional(),
    }).optional(),
})

export async function getSettings() {
    let doc = await Settings.findOne()
    if (!doc) {
        doc = await Settings.create({})
    }
    return JSON.parse(JSON.stringify(doc))
}

export async function updateSettings(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = settingsSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    try {
        await Settings.findOneAndUpdate(
            {},
            { $set: parsed.data },
            { upsert: true, new: true }
        )
        return { success: true, message: "Configurações salvas com sucesso." }
    } catch (err) {
        console.error("Erro ao salvar configurações:", err)
        return { success: false, message: "Erro ao salvar configurações." }
    }
}
