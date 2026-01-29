import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Menu, Search } from "lucide-react"
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
        <header className="border-b bg-white justify-center align-items">
            <div className="grid h-16 items-center gap-3 px-4 grid-cols-[1fr_auto_1fr] h-20">
                <div>
                    <Link href="/" className="font-semibold whitespace-nowrap">
                        DCE
                    </Link>
                </div>

                <div className="justify-self-center w-[32rem] max-w-full">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Pesquisar..."
                            className="w-full h-10"
                        />
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
