'use client'

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet"
import {
    Users, UserPlus, Search, Shield, ShieldOff, Trash2, Pencil,
    CheckCircle2, Clock, Ban, Copy, Check,
} from "lucide-react"
import { inviteUser, updateUserPermissions, suspendUser, deleteUser } from "@/lib/actions/users"

const DEFAULT_ADMIN_EMAIL = "foz.dce@gmail.com"

const ROLE_OPTIONS = [
    { value: "admin", label: "Administrador" },
    { value: "membro", label: "Membro" },
]

const PERMISSION_LABELS = {
    news: "Notícias (Jornal)",
    events: "Eventos",
    correioElegante: "Correio Elegante",
    settings: "Configurações",
}

const DEFAULT_PERMS = { news: true, events: true, correioElegante: true, settings: false }

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-white p-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="size-5" />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    if (status === "ativo") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle2 className="size-3 mr-1" />Ativo</Badge>
    if (status === "convidado") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"><Clock className="size-3 mr-1" />Convidado</Badge>
    if (status === "suspenso") return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><Ban className="size-3 mr-1" />Suspenso</Badge>
    return <Badge variant="outline">{status}</Badge>
}

function RoleBadge({ role }) {
    if (role === "admin") return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100"><Shield className="size-3 mr-1" />Admin</Badge>
    return <Badge variant="outline" className="text-slate-600">Membro</Badge>
}

function PermissionsForm({ role, permissions, onRoleChange, onPermChange }) {
    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label>Nível de acesso</Label>
                <select
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {ROLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                {role === "admin" && (
                    <p className="text-xs text-slate-500 mt-1">Administradores têm acesso total ao sistema, incluindo gerenciamento de usuários.</p>
                )}
            </div>

            {role === "membro" && (
                <div className="space-y-2">
                    <Label>Permissões</Label>
                    <div className="rounded-lg border divide-y">
                        {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                            <label key={key} className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50">
                                <span className="text-sm">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={permissions[key] ?? false}
                                    onChange={(e) => onPermChange(key, e.target.checked)}
                                    className="size-4 rounded accent-slate-800"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function InviteSheet({ onSuccess }) {
    const [open, setOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("membro")
    const [perms, setPerms] = useState(DEFAULT_PERMS)
    const [copied, setCopied] = useState(false)

    function handlePermChange(key, val) {
        setPerms((p) => ({ ...p, [key]: val }))
    }

    function handleRoleChange(val) {
        setRole(val)
        if (val === "admin") setPerms({ news: true, events: true, correioElegante: true, settings: true })
        else setPerms(DEFAULT_PERMS)
    }

    function handleSubmit(e) {
        e.preventDefault()
        startTransition(async () => {
            const result = await inviteUser({ email, role, permissions: perms })
            if (result.success) {
                toast.success(result.message)
                setEmail("")
                setRole("membro")
                setPerms(DEFAULT_PERMS)
                setOpen(false)
                onSuccess()
            } else {
                toast.error(result.message)
            }
        })
    }

    function copyLoginLink() {
        navigator.clipboard.writeText(window.location.origin + "/login")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" className="gap-2">
                    <UserPlus className="size-4" />
                    Convidar usuário
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Convidar usuário</SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-1">
                    <div className="space-y-1.5">
                        <Label htmlFor="invite-email">Email da conta Google</Label>
                        <Input
                            id="invite-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@gmail.com"
                        />
                        <p className="text-xs text-slate-500">A pessoa precisa usar exatamente este email para fazer login com Google.</p>
                    </div>

                    <PermissionsForm
                        role={role}
                        permissions={perms}
                        onRoleChange={handleRoleChange}
                        onPermChange={handlePermChange}
                    />

                    <div className="rounded-lg bg-slate-50 border p-3 space-y-2">
                        <p className="text-xs font-medium text-slate-600">Link de acesso</p>
                        <p className="text-xs text-slate-500">Após criar o convite, compartilhe o link abaixo com a pessoa. Ela precisará fazer login com a conta Google cadastrada.</p>
                        <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={copyLoginLink}>
                            {copied ? <><Check className="size-3.5" />Copiado!</> : <><Copy className="size-3.5" />Copiar link de acesso</>}
                        </Button>
                    </div>

                    <SheetFooter className="flex-col gap-2 sm:flex-col">
                        <Button type="submit" disabled={pending} className="w-full">
                            {pending ? "Criando convite..." : "Criar convite"}
                        </Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="w-full">Cancelar</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

function EditSheet({ user, onSuccess }) {
    const [open, setOpen] = useState(false)
    const [pending, startTransition] = useTransition()
    const [role, setRole] = useState(user.role)
    const [perms, setPerms] = useState(user.permissions)

    function handleRoleChange(val) {
        setRole(val)
        if (val === "admin") setPerms({ news: true, events: true, correioElegante: true, settings: true })
        else setPerms(user.role === "membro" ? user.permissions : DEFAULT_PERMS)
    }

    function handlePermChange(key, val) {
        setPerms((p) => ({ ...p, [key]: val }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        startTransition(async () => {
            const result = await updateUserPermissions({ userId: user.id, role, permissions: perms })
            if (result.success) {
                toast.success(result.message)
                setOpen(false)
                onSuccess()
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" title="Editar permissões">
                    <Pencil className="size-3.5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Editar permissões</SheetTitle>
                    <p className="text-sm text-slate-500">{user.name ?? user.email}</p>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-1">
                    <PermissionsForm
                        role={role}
                        permissions={perms}
                        onRoleChange={handleRoleChange}
                        onPermChange={handlePermChange}
                    />

                    <SheetFooter className="flex-col gap-2 sm:flex-col">
                        <Button type="submit" disabled={pending} className="w-full">
                            {pending ? "Salvando..." : "Salvar alterações"}
                        </Button>
                        <SheetClose asChild>
                            <Button type="button" variant="outline" className="w-full">Cancelar</Button>
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}

function UserRow({ user, currentUserEmail, onRefresh }) {
    const [suspendPending, startSuspend] = useTransition()
    const [deletePending, startDelete] = useTransition()

    const isProtected = user.email === DEFAULT_ADMIN_EMAIL
    const isSelf = user.email === currentUserEmail

    function handleSuspend() {
        startSuspend(async () => {
            const result = await suspendUser(user.id)
            if (result.success) { toast.success(result.message); onRefresh() }
            else toast.error(result.message)
        })
    }

    function handleDelete() {
        startDelete(async () => {
            const result = await deleteUser(user.id)
            if (result.success) { toast.success(result.message); onRefresh() }
            else toast.error(result.message)
        })
    }

    const initials = user.name
        ? user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
        : user.email[0].toUpperCase()

    return (
        <TableRow className={user.status === "suspenso" ? "opacity-60" : ""}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                        <AvatarImage src={user.avatarUrl ?? ""} alt={user.name ?? user.email} />
                        <AvatarFallback className="text-xs bg-slate-100">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name ?? <span className="text-slate-400 italic">Sem nome</span>}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {isSelf && <Badge variant="outline" className="text-xs shrink-0">Você</Badge>}
                </div>
            </TableCell>
            <TableCell><RoleBadge role={user.role} /></TableCell>
            <TableCell><StatusBadge status={user.status} /></TableCell>
            <TableCell className="text-xs text-slate-500">
                {user.lastLoginAt
                    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(user.lastLoginAt))
                    : <span className="italic">Nunca</span>}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    {!isProtected && (
                        <EditSheet user={user} onSuccess={onRefresh} />
                    )}
                    {!isProtected && !isSelf && (
                        <ConfirmDialog
                            title={user.status === "suspenso" ? `Reativar ${user.email}?` : `Suspender ${user.email}?`}
                            subtitle={user.status === "suspenso" ? "O usuário voltará a ter acesso ao sistema." : "O usuário não poderá mais fazer login até ser reativado."}
                            onClick={handleSuspend}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                disabled={suspendPending}
                                title={user.status === "suspenso" ? "Reativar" : "Suspender"}
                            >
                                {user.status === "suspenso" ? <ShieldOff className="size-3.5 text-amber-600" /> : <Ban className="size-3.5 text-amber-600" />}
                            </Button>
                        </ConfirmDialog>
                    )}
                    {!isProtected && !isSelf && (
                        <ConfirmDialog
                            title={`Remover ${user.email}?`}
                            subtitle="O usuário perderá acesso imediatamente. Esta ação não pode ser desfeita."
                            onClick={handleDelete}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                disabled={deletePending}
                                title="Remover"
                            >
                                <Trash2 className="size-3.5 text-red-500" />
                            </Button>
                        </ConfirmDialog>
                    )}
                    {isProtected && (
                        <span className="text-xs text-slate-400 italic px-2">Admin padrão</span>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

export function Display({ users: initialUsers, currentUserEmail }) {
    const router = useRouter()
    const [search, setSearch] = useState("")

    const stats = useMemo(() => ({
        total: initialUsers.length,
        ativos: initialUsers.filter((u) => u.status === "ativo").length,
        convidados: initialUsers.filter((u) => u.status === "convidado").length,
        suspensos: initialUsers.filter((u) => u.status === "suspenso").length,
    }), [initialUsers])

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        if (!q) return initialUsers
        return initialUsers.filter(
            (u) => u.email.includes(q) || (u.name?.toLowerCase().includes(q))
        )
    }, [search, initialUsers])

    function refresh() {
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Users className="size-5 text-slate-600" />
                    <h1 className="text-xl font-bold text-slate-800">Usuários</h1>
                </div>
                <InviteSheet onSuccess={refresh} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={Users} label="Total" value={stats.total} color="bg-slate-100 text-slate-600" />
                <StatCard icon={CheckCircle2} label="Ativos" value={stats.ativos} color="bg-emerald-100 text-emerald-600" />
                <StatCard icon={Clock} label="Convidados" value={stats.convidados} color="bg-amber-100 text-amber-600" />
                <StatCard icon={Ban} label="Suspensos" value={stats.suspensos} color="bg-red-100 text-red-600" />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="rounded-xl border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Usuário</TableHead>
                            <TableHead>Papel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Último login</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                                    {search ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário cadastrado ainda."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    currentUserEmail={currentUserEmail}
                                    onRefresh={refresh}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <p className="text-xs text-slate-400">{filtered.length} usuário(s) exibido(s)</p>
        </div>
    )
}
