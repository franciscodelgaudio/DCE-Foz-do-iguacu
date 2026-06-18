import { UserPlus } from "lucide-react"
import { InscricaoCargoForm } from "@/components/home/InscricaoCargoForm"

export const metadata = {
    title: "Inscrição de Cargo | DCE UNIOESTE Foz",
    description: "Quer fazer parte do DCE UNIOESTE Foz do Iguaçu? Preencha o formulário e candidate-se a um cargo na nossa gestão.",
}

const CARGOS_INFO = [
    { label: "Presidência", desc: "Coordena as atividades gerais do DCE e representa os estudantes." },
    { label: "Direção Executiva", desc: "Apoia a presidência e garante o funcionamento da gestão." },
    { label: "Comunicação e Imprensa", desc: "Gerencia as redes sociais, jornal estudantil e divulgação." },
    { label: "Cultura", desc: "Organiza eventos culturais e promove a vida universitária." },
    { label: "Integração de Campus", desc: "Articula ações entre os diferentes cursos e campi." },
    { label: "Ensino, Pesquisa e Extensão", desc: "Defende os direitos acadêmicos e acompanha políticas educacionais." },
    { label: "Movimento Estudantil", desc: "Articula com outros movimentos estudantis e formação política." },
    { label: "Assistência Estudantil", desc: "Acompanha programas de bolsas, moradia e apoio socioeconômico." },
    { label: "Diversidade", desc: "Promove inclusão e defende pautas de grupos sub-representados." },
]

export default function InscricaoCargoPage() {
    return (
        <main className="w-full min-h-screen bg-[#f3f1ff]">

            {/* Hero */}
            <div className="border-b-[5px] border-[#2708ab] bg-white">
                <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
                    <span className="inline-block rounded-full border-2 border-[#2708ab] px-3 py-1 text-xs font-bold text-[#2708ab]">
                        FAÇA PARTE DO DCE
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#2708ab] md:text-5xl">
                        Inscreva-se em um{" "}
                        <span className="bg-[#fdf25a] px-1">cargo</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                        O DCE é feito por estudantes para estudantes. Se você quer transformar a universidade,
                        candidate-se a um cargo na nossa gestão e ajude a construir um campus melhor.
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">

                    {/* Informações sobre os cargos */}
                    <div className="lg:col-span-2">
                        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                            Cargos disponíveis
                        </p>
                        <div className="flex flex-col gap-3">
                            {CARGOS_INFO.map((cargo) => (
                                <div
                                    key={cargo.label}
                                    className="flex items-start gap-4 rounded-2xl border-2 border-[#2708ab]/15 bg-white p-4"
                                >
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2708ab]/10">
                                        <UserPlus className="h-4 w-4 text-[#2708ab]" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#2708ab]">{cargo.label}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">{cargo.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-2xl border-2 border-[#fdf25a] bg-[#fdf25a]/30 p-5">
                            <p className="text-sm font-bold text-[#2708ab]">Como funciona?</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Após enviar sua inscrição, a diretoria do DCE entrará em contato pelo e-mail
                                informado para dar continuidade ao processo seletivo.
                            </p>
                        </div>
                    </div>

                    {/* Formulário */}
                    <div className="lg:col-span-3">
                        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                            Formulário de inscrição
                        </p>
                        <div className="rounded-2xl border-2 border-[#2708ab]/20 bg-white p-6 shadow-sm">
                            <InscricaoCargoForm />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
