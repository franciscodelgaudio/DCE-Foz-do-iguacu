"use client"

import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CircleUser, Menu, Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signInWithGoogle, logout } from "@/lib/actions/auth"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

const LOGO_MARK_SRC = "/images/home/logo.png"

const NAV_LINKS = [
    { href: "/home", label: "Início", exact: true },
    { href: "/home/news", label: "Jornal" },
    { href: "/home/events", label: "Eventos" },
    { href: "/home/sobre-o-dce", label: "Sobre o DCE" },
    { href: "/home/contato", label: "Contato" },
]

function HeaderLogo({ compact = false }) {
    return (
        <div className="flex items-center">
            <Image
                src={LOGO_MARK_SRC}
                alt="DCE"
                width={2000}
                height={2000}
                className={compact ? "h-10 w-10 object-contain" : "h-14 w-14 object-contain"}
                priority
            />
            <div className={compact ? "mx-2.5 h-8 w-0.5 bg-[#2708ab]" : "mx-3.5 h-11 w-0.5 bg-[#2708ab]"} />
            <div className="flex min-w-0 flex-col justify-center text-[#2708ab]">
                <div className={compact ? "text-base font-extrabold leading-none" : "text-[17px] font-extrabold leading-none"}>
                    DCE UNIOESTE
                </div>
                <div className={compact ? "mt-1 text-[10px] leading-none text-[#3322a3]" : "mt-1 text-[11px] leading-none text-[#3322a3]"}>
                    Diretório Central dos Estudantes
                </div>
                <span className={compact ? "mt-1.5 block h-0.5 w-8 bg-[#fdf25a]" : "mt-1.5 block h-0.5 w-10 bg-[#fdf25a]"} />
            </div>
        </div>
    )
}

function SearchForm({ onSearch }) {
    const [query, setQuery] = useState("")
    const router = useRouter()

    const handleSubmit = (e) => {
        e.preventDefault()
        const q = query.trim()
        if (q) router.push(`/home/search?q=${encodeURIComponent(q)}`)
        onSearch?.()
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
            <Input
                placeholder="Pesquisar notícias..."
                className="h-9 w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Buscar">
                <Search className="h-4 w-4" />
            </Button>
        </form>
    )
}

function UserMenu({ user }) {
    return !user ? (
        <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" size="sm" className="h-9 gap-2 shrink-0">
                <CircleUser className="h-4 w-4" />
                Login
            </Button>
        </form>
    ) : (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-2 gap-2 shrink-0">
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback className="text-xs">{user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block max-w-[140px] truncate text-sm">{user?.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <button type="button" className="w-full text-left" onClick={logout}>
                        Sair
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DesktopNavLink({ href, label, exact }) {
    const pathname = usePathname()
    const isActive = exact ? pathname === href : pathname.startsWith(href)

    return (
        <Link
            href={href}
            className={[
                "relative px-3 py-2 text-sm font-medium transition-colors",
                isActive
                    ? "text-[#2708ab] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-[#2708ab]"
                    : "text-slate-600 hover:text-[#2708ab]",
            ].join(" ")}
        >
            {label}
        </Link>
    )
}

function MobileNavLink({ href, label }) {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + "/")

    return (
        <Link
            href={href}
            className={[
                "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-[#f3f1ff] text-[#2708ab]" : "hover:bg-slate-100 text-slate-700",
            ].join(" ")}
        >
            {label}
        </Link>
    )
}

export function Header({ user }) {
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 bg-white">
            {/* ── MOBILE ── */}
            <div className="md:hidden border-b px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                    <Link href="/home" className="shrink-0">
                        <HeaderLogo compact />
                    </Link>

                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={[
                                "h-9 w-9 transition-colors",
                                mobileSearchOpen ? "bg-slate-100 text-[#2708ab]" : "",
                            ].join(" ")}
                            onClick={() => setMobileSearchOpen(v => !v)}
                            aria-label="Pesquisar"
                            aria-expanded={mobileSearchOpen}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 border-2 border-[#2708ab] bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab] hover:bg-[#fff86f]"
                                    aria-label="Menu"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[260px]">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-1">
                                    {NAV_LINKS.map((link) => (
                                        <MobileNavLink key={link.href} href={link.href} label={link.label} />
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {!user ? (
                            <form action={signInWithGoogle}>
                                <Button type="submit" variant="ghost" size="icon" className="h-9 w-9" aria-label="Login">
                                    <CircleUser className="h-5 w-5" />
                                </Button>
                            </form>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Conta">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={user?.image} alt={user?.name} />
                                            <AvatarFallback className="text-xs">{user?.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm">{user?.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <button type="button" className="w-full text-left" onClick={logout}>
                                            Sair
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Busca colapsável */}
                <div
                    className={[
                        "overflow-hidden transition-[max-height,opacity,margin-top] duration-300 ease-out",
                        mobileSearchOpen ? "max-h-16 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0",
                    ].join(" ")}
                >
                    <SearchForm onSearch={() => setMobileSearchOpen(false)} />
                </div>
            </div>

            {/* ── DESKTOP ── */}
            <div className="hidden md:block">
                {/* Barra superior: logo + busca + login */}
                <div className="flex h-16 items-center gap-4 border-b px-6">
                    <Link href="/home" className="shrink-0">
                        <HeaderLogo />
                    </Link>

                    <div className="flex-1" />

                    <div className="w-72">
                        <SearchForm />
                    </div>

                    <UserMenu user={user} />
                </div>

                {/* Barra de navegação */}
                <div className="border-b bg-white">
                    <nav className="flex items-center px-4 h-10">
                        {NAV_LINKS.map((link) => (
                            <DesktopNavLink key={link.href} {...link} />
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    )
}
