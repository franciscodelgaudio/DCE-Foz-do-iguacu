import Link from "next/link"
import { Mail } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"

const SOCIAL = [
    {
        label: "Instagram",
        href: "https://www.instagram.com/dceunioestefoz/",
        icon: FaInstagram,
    },
    {
        label: "WhatsApp",
        href: "https://chat.whatsapp.com/HjmoAm2nJZF45jw7bGuVUt",
        icon: FaWhatsapp,
    },
    {
        label: "E-mail",
        href: "mailto:foz.dce@unioeste.br",
        icon: Mail,
    },
]

export function Footer() {
    return (
        <footer className="w-full border-t-4 border-[#2708ab] bg-[#fdf25a]">
            <div className="mx-auto max-w-[1400px] px-6 py-6 md:px-10">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-[#2708ab]">
                        © Diretório Central dos Estudantes — Foz do Iguaçu 2026. Todos os direitos reservados.
                    </p>

                    <div className="flex items-center gap-1">
                        {SOCIAL.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                target={href.startsWith("mailto") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#2708ab] bg-[#2708ab] text-white shadow-[2px_2px_0_#2708ab] transition-all hover:bg-[#1a0580] hover:shadow-[3px_3px_0_#2708ab]"
                            >
                                <Icon className="h-4 w-4" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
