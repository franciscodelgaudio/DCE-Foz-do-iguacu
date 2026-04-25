'use client'

import Image from "next/image"

const team = [
    { name: "Beatriz", role: "Presidente e Coordenadora de Movimento Estudantil & Formação Política", photo: "/images/team/beatriz-20260425.jpg" },
    { name: "Alcieris", role: "Vice-Presidente e Tesoureiro", photo: "/images/team/alcieres-20260425.jpg" },
    { name: "Francisco", role: "Secretário e Coordenador de Comunicação e Imprensa", photo: "/images/team/francisco-20260425.jpg" },
    { name: "Pietra", role: "Coordenadora de Comunicação & Imprensa", photo: "/images/team/pietra-20260425.jpg" },
    { name: "Ana Clara", role: "Coordenadora de Assistência Estudantil", photo: "/images/team/ana-clara-20260425.jpg" },
    { name: "Victor", role: "Coordenador de Assistência Estudantil", photo: "/images/team/victor-20260425.jpg" },
    { name: "Evy", role: "Coordenadora de Cultura", photo: "/images/team/evy-20260425.jpg" },
    { name: "Ketlyn", role: "Coordenadora de Ensino, Pesquisa & Extensão", photo: "/images/team/ketlyn-20260425.jpg" },
    { name: "André", role: "Coordenador de Integração de Campus", photo: "/images/team/andre-20260425.jpg" },
    { name: "Lohana", role: "Coordenadora de Diversidade", photo: "/images/team/lohana-20260425.jpg" },
    { name: "Izzy", role: "Coordenadora de Diversidade", photo: "/images/team/izzy-20260425.jpg" },
]

export function MemberSession() {
    return (
        <section className="w-full">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-16 md:px-10">
                {/* chip alinhado à esquerda */}
                <div className="inline-flex border-b-4 border-[#2708ab] bg-[#fdf25a] px-4 py-2 shadow-[4px_4px_0_#2708ab]">
                    <h2 className="text-lg font-extrabold text-[#2708ab]">Coordenação do DCE</h2>
                </div>

                {/* MOBILE (<md) */}
                <div className="md:hidden mt-8">
                    <div
                        className="
              flex gap-5 overflow-x-auto pb-2
              snap-x snap-mandatory scroll-smooth
              [-webkit-overflow-scrolling:touch]
            "
                    >
                        {team.map((p) => (
                            <article key={p.name} className="snap-start shrink-0 w-[150px] text-center">
                                <div className="relative h-[132px] w-[132px] mx-auto overflow-hidden rounded-full">
                                    <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="132px" />
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

                {/* DESKTOP (md+) agora também é scroll horizontal */}
                <div className="hidden md:block mt-10">
                    <div
                        className="
              flex flex-nowrap gap-7 overflow-x-auto pb-3
              snap-x snap-mandatory scroll-smooth
              [-webkit-overflow-scrolling:touch]
            "
                    >
                        {team.map((p) => (
                            <article key={p.name} className="snap-start shrink-0 w-44 text-center">
                                <div className="relative h-44 w-44 mx-auto overflow-hidden rounded-full">
                                    <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="176px" />
                                </div>

                                <h3 className="mt-6 text-lg font-extrabold text-[#2708ab]">{p.name}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">{p.role}</p>
                            </article>
                        ))}
                    </div>

                    {/* hint discreto (desktop) */}
                    <p className="mt-3 text-sm text-slate-500">
                        Role para o lado para ver toda a coordenação →
                    </p>
                </div>
            </div>
        </section>
    )
}
