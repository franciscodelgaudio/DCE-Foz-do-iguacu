"use client"

import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CircleUser, Menu, Search } from "lucide-react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

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
import { useState } from "react"

const LOGO_MARK_SRC = "/images/home/logo.png"

function HeaderLogo({ compact = false }) {
    return (
        <div className="flex items-center">
            <Image
                src={LOGO_MARK_SRC}
                alt="DCE"
                width={2000}
                height={2000}
                className={compact ? "h-12 w-12 object-contain" : "h-20 w-20 object-contain"}
                priority
            />

            <div className={compact ? "mx-3 h-10 w-0.5 bg-[#2708ab]" : "mx-5 h-17 w-0.5 bg-[#2708ab]"} />

            <div className="flex min-w-0 flex-col justify-center text-[#2708ab]">
                <div
                    className={
                        compact
                            ? "text-[18px] font-extrabold leading-none tracking-normal"
                            : "text-[22px] font-extrabold leading-none tracking-normal"
                    }
                >
                    DCE UNIOESTE
                </div>
                <div
                    className={
                        compact
                            ? "mt-1 text-[11px] leading-none text-[#3322a3]"
                            : "mt-1 text-[12px] leading-none text-[#3322a3]"
                    }
                >
                    Diretório Central dos Estudantes
                </div>
                <div className={compact ? "mt-1.5 flex items-center gap-2" : "mt-1.5 flex items-center gap-2.5"}>
                    <span className={compact ? "h-0.5 w-10 bg-[#fdf25a]" : "h-0.5 w-12 bg-[#fdf25a]"} />
                    {/* <span className={compact ? "text-[12px] font-bold leading-none" : "text-[11px] font-bold leading-none"}>
                        Foz do Iguaçu
                    </span> */}
                </div>
            </div>
        </div>
    )
}

export function Header({ user }) {

    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

    return (
        <header className="border-b bg-white">
            {/* MOBILE */}
            <div className="md:hidden px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    {/* Logo */}
                    <Link href="/home" className="shrink-0">
                        <HeaderLogo compact />
                    </Link>

                    {/* Ícones (direita) */}
                    <div className="flex items-center gap-1">
                        {/* Lupa (toggle da busca) */}
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            onClick={() => setMobileSearchOpen(v => !v)}
                            aria-label="Pesquisar"
                            aria-expanded={mobileSearchOpen}
                        >
                            <Search className="size-6" />
                        </Button>

                        {/* Menu (Sheet) */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 w-10 border-2 border-[#2708ab] bg-[#fdf25a] p-0 text-[#2708ab] shadow-[2px_2px_0_#2708ab] hover:bg-[#fff86f] hover:text-[#2708ab]"
                                    aria-label="Menu"
                                >
                                    <Menu className="size-6" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>

                                <nav className="mt-6 flex flex-col gap-2">
                                    <Link href="/home" className="rounded-md px-3 py-2 text-sm hover:bg-slate-100">
                                        Início
                                    </Link>
                                    <Link href="/home/news" className="rounded-md px-3 py-2 text-sm hover:bg-slate-100">
                                        Jornal
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* Login / Avatar */}
                        {!user ? (
                            <form action={signInWithGoogle}>
                                <Button type="submit" variant="ghost" className="h-10 w-10 p-0" aria-label="Login">
                                    <CircleUser className="h-6 w-6" />
                                </Button>
                            </form>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 w-10 p-0" aria-label="Conta">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.image} alt={user?.name} />
                                            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Conta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Ir para o dashboard</Link>
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

                {/* Busca colapsável com transição suave */}
                <div
                    className={[
                        "overflow-hidden transition-[max-height,opacity,margin-top] duration-300 ease-out",
                        mobileSearchOpen ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0",
                    ].join(" ")}
                >
                    <div className="flex items-center gap-2">
                        <Input placeholder="Pesquisar..." className="h-10 w-full" />
                        <Button type="button" variant="ghost" className="h-10 w-10 p-0" aria-label="Buscar">
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="hidden md:grid h-30 items-center gap-3 px-4 grid-cols-[560px_1fr_auto_auto]">
                <div className="min-w-[560px]">
                    <Link href="/home" className="block w-[530px]">
                        <HeaderLogo />
                    </Link>
                </div>


                <div className="justify-self-center w-[32rem] max-w-full">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Pesquisar..." className="w-full h-10" />
                        <Search />
                    </div>
                </div>

                <div className="justify-self-end">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    className="flex h-10 items-center justify-center gap-2 rounded-md border-2 border-[#2708ab] bg-[#fdf25a] px-4 text-[#2708ab] shadow-[3px_3px_0_#2708ab] hover:bg-[#fff86f] hover:text-[#2708ab] data-[state=open]:bg-[#fff86f] data-[state=open]:text-[#2708ab]"
                                    menu={true}
                                >
                                    <Menu
                                        className="relative size-6 transition duration-300 group-data-[state=open]:rotate-180"
                                        aria-hidden="true"
                                    />
                                    <span className="font-extrabold text-base">MENU</span>
                                </NavigationMenuTrigger>

                                <NavigationMenuContent>
                                    <NavigationMenuLink href="/home">Início</NavigationMenuLink>
                                    <NavigationMenuLink href="/home/news">Jornal</NavigationMenuLink>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="justify-self-end">
                    {!user ? (
                        <form action={signInWithGoogle}>
                            <Button type="submit" variant="outline" className="h-10 gap-2">
                                <CircleUser className="h-5 w-5" />
                                Login
                            </Button>
                        </form>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 px-2 gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.image} alt={user?.name} />
                                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <span className="max-w-[160px] truncate text-sm font-medium">
                                        {user?.name}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">Ir para o dashboard</Link>
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
        </header>
    )
}
