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
import Image from "next/image"

export function Header({ user }) {
  return (
    <header className="border-b bg-white">
      <div
        className="
          grid items-center gap-3 px-4 py-3
          grid-cols-[1fr_auto]
          md:py-0 md:h-30 md:grid-cols-[1fr_auto_1fr_auto]
        "
      >
        {/* LOGO */}
        <div className="col-start-1 row-start-1 md:col-auto md:row-auto">
          <Link href="/" className="font-semibold whitespace-nowrap">
            <Image src="/images/home/logo.png" alt="DCE Logo" width={100} height={40} />
          </Link>
        </div>

        {/* AÇÕES (mobile: topo direita) | (desktop: vira "contents" e mantém colunas originais) */}
        <div className="col-start-2 row-start-1 justify-self-end flex items-center gap-2 md:contents">
          {/* MENU (desktop: coluna 3) */}
          <div className="md:justify-self-end">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className="h-10 px-2 sm:px-4 rounded-md hover:bg-slate-100 justify-center items-center flex gap-2"
                    menu={true}
                  >
                    <Menu
                      className="relative size-6 transition duration-300 group-data-[state=open]:rotate-180"
                      aria-hidden="true"
                    />
                    {/* some no xs para caber melhor no mobile */}
                    <span className="font-bold text-base hidden sm:inline">MENU</span>
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <NavigationMenuLink href="/#">#</NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* LOGIN / AVATAR (desktop: coluna 4) */}
          <div className="md:justify-self-end">
            {!user ? (
              <form action={signInWithGoogle}>
                <Button type="submit" variant="outline" className="h-10 gap-2 px-2 sm:px-4">
                  <CircleUser className="h-5 w-5" />
                  {/* some no xs para caber melhor no mobile */}
                  <span className="hidden sm:inline">Login</span>
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
                    {/* esconde nome no xs para não estourar */}
                    <span className="hidden sm:inline max-w-[160px] truncate text-sm font-medium">
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

        {/* BUSCA (mobile: linha de baixo full width | desktop: igual ao atual) */}
        <div
          className="
            col-span-2 w-full
            md:col-span-1 md:justify-self-center md:w-[32rem] md:max-w-full
          "
        >
          <div className="flex items-center gap-2">
            <Input placeholder="Pesquisar..." className="w-full h-10" />
            <Search className="shrink-0" />
          </div>
        </div>
      </div>
    </header>
  )
}
