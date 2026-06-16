'use client'

import Image from "next/image"

const team = [
    { name: "Beatriz", role: "Presidente e Coordenadora de Movimento Estudantil & Formação Política", photo: "/images/team/beatriz-20260425.jpg", position: "50% 42%" },
    { name: "Alcieris", role: "Vice-Presidente e Tesoureiro", photo: "/images/team/alcieres-20260425.jpg", position: "50% 35%" },
    { name: "Francisco", role: "Secretário Executivo", photo: "/images/team/francisco-20260425.jpg", position: "50% 34%" },
    { name: "Pietra", role: "Coordenadora de Comunicação & Imprensa", photo: "/images/team/pietra-20260425.jpg", position: "50% 36%" },
    { name: "Ana Clara", role: "Coordenadora de Assistência Estudantil", photo: "/images/team/ana-clara-20260425.jpg", position: "45% 33%" },
    { name: "Victor", role: "Coordenador de Assistência Estudantil, Movimento Estudantil & Formação Política", photo: "/images/team/victor-20260425.jpg", position: "50% 28%" },
    { name: "Evy", role: "Coordenadora de Cultura", photo: "/images/team/evy-20260425.jpg", position: "63% 34%" },
    { name: "Ketlyn", role: "Coordenadora de Ensino, Pesquisa & Extensão e Cultura", photo: "/images/team/ketlyn-20260425.jpg", position: "50% 34%" },
    { name: "André", role: "Coordenador de Integração de Campus", photo: "/images/team/andre-20260425.jpg", position: "50% 34%" },
    { name: "Izzy", role: "Coordenadora de Diversidade", photo: "/images/team/izzy-20260425.jpg", position: "50% 34%" },
]

export function MemberSession() {
    return (
        <section className="w-full bg-[#f3f1ff]">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-16 md:px-10">
                <div className="inline-flex border-b-4 border-[#2708ab] bg-[#fdf25a] px-4 py-2 shadow-[4px_4px_0_#2708ab]">
                    <h2 className="text-lg font-extrabold text-[#2708ab]">Coordenação do DCE</h2>
                </div>

                <div className="mt-8 md:hidden">
                    <div
                        className="
                            flex gap-5 overflow-x-auto pb-2
                            snap-x snap-mandatory scroll-smooth
                            [-webkit-overflow-scrolling:touch]
                            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                        "
                    >
                        {team.map((p) => (
                            <article key={p.name} className="snap-start w-[150px] shrink-0 text-center">
                                <div className="relative mx-auto aspect-[4/5] w-[140px] overflow-hidden rounded-lg bg-white shadow-[6px_6px_0_#2708ab]">
                                    <Image
                                        src={p.photo}
                                        alt={p.name}
                                        fill
                                        className="object-cover"
                                        style={{ objectPosition: p.position }}
                                        sizes="140px"
                                    />
                                </div>
                                <h3 className="mt-4 text-base font-extrabold text-[#2708ab]">{p.name}</h3>
                                <p className="mt-1 text-xs leading-relaxed text-slate-700">{p.role}</p>
                            </article>
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Arraste para o lado para ver toda a coordenação →
                    </p>
                </div>

                <div className="mt-10 hidden md:block">
                    <div
                        className="
                            flex flex-nowrap gap-8 overflow-x-auto pb-3
                            snap-x snap-mandatory scroll-smooth
                            [-webkit-overflow-scrolling:touch]
                            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                        "
                    >
                        {team.map((p) => (
                            <article key={p.name} className="snap-start w-44 shrink-0 text-center">
                                <div className="relative mx-auto aspect-[4/5] w-44 overflow-hidden rounded-lg bg-white shadow-[8px_8px_0_#2708ab]">
                                    <Image
                                        src={p.photo}
                                        alt={p.name}
                                        fill
                                        className="object-cover"
                                        style={{ objectPosition: p.position }}
                                        sizes="176px"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-extrabold text-[#2708ab]">{p.name}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">{p.role}</p>
                            </article>
                        ))}
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                        Role para o lado para ver toda a coordenação →
                    </p>
                </div>
            </div>
        </section>
    )
}
