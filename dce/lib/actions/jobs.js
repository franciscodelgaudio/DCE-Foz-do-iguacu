'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Job } from "../../models/job"
import mongoose from "mongoose"

const jobSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1, "Título é obrigatório"),
    area: z.string().optional(),
    description: z.string().optional(),
    requirements: z.string().optional(),
    workload: z.string().optional(),
    status: z.enum(["open", "closed"]).optional(),
})

export async function upsertJob(form) {
    const session = await auth()
    if (!session) redirect("/login")

    const parsed = jobSchema.safeParse(form)
    if (!parsed.success) return { success: false, message: "Dados inválidos." }

    const { _id, title, area, description, requirements, workload, status } = parsed.data

    const id = _id ? new mongoose.Types.ObjectId(_id) : new mongoose.Types.ObjectId()

    const update = {
        title,
        area: area ?? "",
        description: description ?? "",
        requirements: requirements ?? "",
        workload: workload ?? "",
        status: status ?? "open",
        author: {
            name: session.user.name,
            email: session.user.email,
        },
    }

    if (status === "open" && !_id) {
        update.publishedAt = new Date()
    }

    await Job.findByIdAndUpdate(id, { $set: update }, { upsert: true, new: true })

    return { success: true, message: _id ? "Vaga atualizada!" : "Vaga criada!" }
}

export async function deleteJob(id) {
    const session = await auth()
    if (!session) redirect("/login")

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, message: "ID inválido." }
    }

    await Job.findByIdAndDelete(id)
    return { success: true, message: "Vaga removida." }
}

export async function deleteManyJobs(ids) {
    const session = await auth()
    if (!session) redirect("/login")

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))
    if (validIds.length === 0) return { success: false, message: "Nenhum ID válido." }

    await Job.deleteMany({ _id: { $in: validIds } })
    return { success: true, message: `${validIds.length} vaga(s) removida(s).` }
}
