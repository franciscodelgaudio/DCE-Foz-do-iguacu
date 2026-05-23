import Link from "next/link"
import { ArrowRight, Users, GraduationCap, Shield } from "lucide-react"

const stats = [
    { icon: <GraduationCap className="size-6" strokeWidth={1.5} />, value: "14", label: "Centros Acadêmicos articulados" },
    { icon: <Users className="size-6" strokeWidth={1.5} />, value: "100%", label: "dos estudantes representados" },
    { icon: <Shield className="size-6" strokeWidth={1.5} />, value: "Você", label: "já é membro do DCE" },
]

export function AboutCalloutSession() {
    return (
        <section className="w-full border-t-[5px] border-[#2708ab] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">

                    {/* Left — text */}
                    <div>
                        <span className="inline-block rounded-full border-2 border-[#2708ab] px-3 py-1 text-xs font-bold text-[#2708ab]">
                            O QUE É O DCE?
                        </span>

                        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#2708ab] md:text-4xl">
                            14 CAs. Um DCE.{" "}
                            <span className="bg-[#fdf25a] px-1">Todos os estudantes.</span>
                        </h2>

                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            O DCE é a entidade que representa <strong className="text-[#2708ab]">todos os estudantes</strong> da
                            UNIOESTE Foz — defende seus direitos, organiza eventos, fiscaliza a gestão
                            e articula os 14 Centros Acadêmicos do campus.
                        </p>

                        <Link
                            href="/home/sobre-o-dce"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl border-4 border-[#2708ab] bg-[#2708ab] px-6 py-3 text-base font-extrabold text-white shadow-[4px_4px_0_#fdf25a] transition-all hover:bg-[#1a0580] hover:shadow-[6px_6px_0_#fdf25a]"
                        >
                            Conheça o DCE
                            <ArrowRight className="size-5" />
                        </Link>
                    </div>

                    {/* Right — stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border-2 border-[#2708ab]/15 bg-[#f3f1ff] p-5 text-center"
                            >
                                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                                    {stat.icon}
                                </div>
                                <p className="text-2xl font-extrabold text-[#2708ab]">{stat.value}</p>
                                <p className="mt-1 text-xs leading-snug text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    )
}
