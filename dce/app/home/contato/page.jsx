import { Mail } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"
import { ContactPageForm } from "@/components/home/ContactPageForm"

export const metadata = {
    title: "Contato | DCE UNIOESTE Foz",
    description: "Entre em contato com o Diretório Central dos Estudantes da UNIOESTE Foz do Iguaçu pelo Instagram, WhatsApp ou e-mail.",
}

const SOCIAL_LINKS = [
    {
        label: "Instagram",
        handle: "@dceunioestefoz",
        href: "https://www.instagram.com/dceunioestefoz/",
        icon: FaInstagram,
        bg: "bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]",
        description: "Acompanhe novidades, publicações e stories do DCE",
    },
    {
        label: "WhatsApp — Chat Geral",
        handle: "Grupo aberto para todos os estudantes",
        href: "https://chat.whatsapp.com/HjmoAm2nJZF45jw7bGuVUt",
        icon: FaWhatsapp,
        bg: "bg-[#25d366]",
        description: "Participe do grupo de WhatsApp do DCE",
    },
    {
        label: "E-mail",
        handle: "foz.dce@unioeste.br",
        href: "mailto:foz.dce@unioeste.br",
        icon: Mail,
        bg: "bg-[#2708ab]",
        description: "Para assuntos formais ou que precisem de resposta oficial",
    },
]

function SocialCard({ label, handle, href, icon: Icon, bg, description }) {
    return (
        <a
            href={href}
            target={href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border-2 border-[#2708ab]/15 bg-white p-5 transition-all hover:border-[#2708ab] hover:shadow-[4px_4px_0_#2708ab]"
        >
            <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} text-white shadow-[2px_2px_0_#2708ab]`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
                <p className="font-bold text-[#2708ab]">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700 break-all">{handle}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
        </a>
    )
}

export default function ContatoPage() {
    return (
        <main className="w-full min-h-screen bg-[#f3f1ff]">

            {/* Hero */}
            <div className="border-b-[5px] border-[#2708ab] bg-white">
                <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
                    <span className="inline-block rounded-full border-2 border-[#2708ab] px-3 py-1 text-xs font-bold text-[#2708ab]">
                        CONTATO
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#2708ab] md:text-5xl">
                        Fale com o{" "}
                        <span className="bg-[#fdf25a] px-1">DCE</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                        Estamos disponíveis por várias plataformas. Escolha a que for mais conveniente para você ou preencha o formulário abaixo.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

                    {/* Redes sociais */}
                    <div className="lg:col-span-2">
                        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                            Nossas redes e canais
                        </p>
                        <div className="flex flex-col gap-3">
                            {SOCIAL_LINKS.map((s) => (
                                <SocialCard key={s.label} {...s} />
                            ))}
                        </div>

                        <div className="mt-8 rounded-2xl border-2 border-[#fdf25a] bg-[#fdf25a]/30 p-5">
                            <p className="text-sm font-bold text-[#2708ab]">Horário de atendimento</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Segunda a sexta, das 8h às 18h durante o período letivo.
                                Para urgências, prefira o WhatsApp.
                            </p>
                        </div>
                    </div>

                    {/* Formulário */}
                    <div className="lg:col-span-3">
                        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                            Formulário de contato
                        </p>
                        <div className="rounded-2xl border-2 border-[#2708ab]/20 bg-white p-6 shadow-sm">
                            <ContactPageForm />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
