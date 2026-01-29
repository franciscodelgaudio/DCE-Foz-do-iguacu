import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-white">
            <div className="grid h-16 items-center gap-3 px-4 grid-cols-[1fr_auto_1fr]">
                {/* ESQUERDA */}
                <div>
                    <Link href="/" className="font-semibold whitespace-nowrap">
                        DCE
                    </Link>
                </div>

                {/* CENTRO */}
                <div className="justify-self-center w-[32rem] max-w-full">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Pesquisar..." className="w-full" />
                        <Search />
                    </div>
                </div>

                <div className="justify-self-end">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>MENU</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <NavigationMenuLink>Link</NavigationMenuLink>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </header>
    )
}
