import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { dbConnect } from "@/lib/mongoose"
import { User } from "@/models/user"
import { Display } from "@/components/dashboard/usuarios/Display"

export const metadata = { title: "Usuários – Dashboard" }
export const revalidate = 0

const DEFAULT_ADMIN_EMAIL = "foz.dce@gmail.com"

export default async function Page() {
    const session = await auth()
    if (!session) redirect("/login")

    const email = session.user?.email?.toLowerCase()
    await dbConnect()

    const dbUser = await User.findOne({ email }).lean()
    const isAdmin = email === DEFAULT_ADMIN_EMAIL || dbUser?.role === "admin"

    if (!isAdmin) redirect("/dashboard")

    const usersRaw = await User.find({}).sort({ createdAt: -1 }).lean()

    const users = usersRaw.map((u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name ?? null,
        avatarUrl: u.avatarUrl ?? null,
        role: u.role,
        permissions: {
            news: u.permissions?.news ?? true,
            events: u.permissions?.events ?? true,
            correioElegante: u.permissions?.correioElegante ?? true,
            settings: u.permissions?.settings ?? false,
        },
        status: u.status,
        invitedBy: u.invitedBy ?? null,
        invitedAt: u.invitedAt?.toISOString() ?? null,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt?.toISOString() ?? null,
    }))

    return (
        <div className="p-6">
            <Display users={users} currentUserEmail={email} />
        </div>
    )
}
