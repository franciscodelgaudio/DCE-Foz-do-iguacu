"use client"

import Link from "next/link"
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

export function Header({ user }) {
    return (
        <header className="border-b bg-white">
            <div className="grid h-20 items-center gap-3 px-4 grid-cols-[1fr_auto_1fr_auto]">
                <div>
                    <Link href="/" className="font-semibold whitespace-nowrap">
                        DCE
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
                                    className="h-10 px-4 rounded-md hover:bg-slate-100 justify-center items-center flex gap-2"
                                    menu={true}
                                >
                                    <Menu
                                        className="relative size-6 transition duration-300 group-data-[state=open]:rotate-180"
                                        aria-hidden="true"
                                    />
                                    <span className="font-bold text-base">MENU</span>
                                </NavigationMenuTrigger>

                                <NavigationMenuContent>
                                    <NavigationMenuLink href="/#">#</NavigationMenuLink>
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
