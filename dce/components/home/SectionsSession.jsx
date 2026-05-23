import Link from "next/link"
import { CalendarDays, Newspaper, ArrowRight } from "lucide-react"

const SECTIONS = [
    {
        href: "/home/news",
        icon: Newspaper,
        label: "Jornal",
        description: "Notícias, comunicados e publicações do DCE.",
        accent: "#2708ab",
    },
    {
        href: "/home/events",
        icon: CalendarDays,
        label: "Eventos",
        description: "Próximas atividades, palestras e encontros do diretório.",
        accent: "#2708ab",
    },
]

export function SectionsSession() {
    return (
        <section className="w-full bg-white border-b border-zinc-100">
            <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {SECTIONS.map(({ href, icon: Icon, label, description }) => (
                        <Link
                            key={href}
                            href={href}
                            className="group flex items-center gap-5 rounded-xl border-2 border-transparent bg-[#f3f1ff] px-6 py-5 transition-all duration-200 hover:border-[#2708ab] hover:bg-white hover:shadow-[4px_4px_0_#2708ab]"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab] transition-transform duration-200 group-hover:-translate-y-0.5">
                                <Icon className="h-6 w-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-[#2708ab]">{label}</div>
                                <p className="mt-0.5 text-sm text-slate-500 leading-snug">{description}</p>
                            </div>

                            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#2708ab]" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
