import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"

const SOCIAL_LINKS = [
    {
        label: "Instagram",
        handle: "@dceunioestefoz",
        href: "https://www.instagram.com/dceunioestefoz/",
        icon: FaInstagram,
        bg: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
    },
    {
        label: "WhatsApp",
        handle: "Chat Geral",
        href: "https://chat.whatsapp.com/HjmoAm2nJZF45jw7bGuVUt",
        icon: FaWhatsapp,
        bg: "bg-[#25d366]",
    },
    {
        label: "E-mail",
        handle: "foz.dce@unioeste.br",
        href: "mailto:foz.dce@unioeste.br",
        icon: Mail,
        bg: "bg-[#2708ab]",
    },
]

export function ContactSession() {
    return (
        <section className="w-full border-t border-[#2708ab]/10 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">

                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fale com a gente</p>
                        <h2 className="mt-2 text-xl font-extrabold text-[#2708ab]">
                            O DCE está sempre <span className="bg-[#fdf25a] px-1">disponível</span>
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Dúvidas, sugestões ou apoio? Nos encontre nas redes ou envie uma mensagem.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {SOCIAL_LINKS.map(({ label, handle, href, icon: Icon, bg }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("mailto") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                title={`${label} — ${handle}`}
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-white shadow-[2px_2px_0_#2708ab] transition-all hover:shadow-[3px_3px_0_#2708ab] hover:scale-105`}
                            >
                                <Icon className="h-5 w-5" />
                            </a>
                        ))}

                        <Link
                            href="/home/contato"
                            className="ml-1 inline-flex items-center gap-2 rounded-xl border-2 border-[#2708ab] px-4 py-2 text-sm font-bold text-[#2708ab] transition-all hover:bg-[#2708ab] hover:text-white"
                        >
                            Enviar mensagem
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    )
}
