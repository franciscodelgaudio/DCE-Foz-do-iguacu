'use client'

import Image from "next/image"

const team = [
    { name: "Beatriz", role: "Presidenta", photo: "/images/team/beatriz.jpg" },
    { name: "Alcieris", role: "Vice-Presidente e Tesouraria", photo: "/images/team/alcieris.jpg" },
    { name: "Ana", role: "Secretário", photo: "/images/team/ana.jpg" },
    { name: "Francisco", role: "Coordenação de Comunicação & Imprensa", photo: "/images/team/francisco.jpg" },
    { name: "Pietra", role: "Coordenação de Comunicação & Imprensa", photo: "/images/team/pietra.jpg" },
    { name: "Ana Clara", role: "Coordenação de Assistência Estudantil", photo: "/images/team/ana-clara.jpg" },
    { name: "João", role: "Coordenação de Assistência Estudantil", photo: "/images/team/joao.jpg" },
    { name: "Evy", role: "Coordenação de Cultura", photo: "/images/team/evy.jpg" },
    { name: "Felipe", role: "Coordenação de Movimento Estudantil & Formações Políticas", photo: "/images/team/felipe.jpg" },
    { name: "Daf", role: "Coordenação de Movimento Estudantil & Formações Políticas", photo: "/images/team/daf.jpg" },
    { name: "Sara", role: "Coordenação de Movimento Estudantil & Formações Políticas", photo: "/images/team/sara.jpg" },
    { name: "André", role: "Coordenação de Integração de Campus", photo: "/images/team/andre.jpg" },
    { name: "Shayni", role: "Coordenação de Integração de Campus", photo: "/images/team/shayni.jpg" },
    { name: "Lohana", role: "Coordenação de Diversidade", photo: "/images/team/lohana.jpg" },
]

export function MemberSession() {
    return (
        <section className="w-full">
            <div className="mx-auto w-full max-w-[1500px] px-6 py-16 md:px-10">
                {/* chip alinhado à esquerda */}
                <div className="inline-flex bg-slate-900 px-4 py-2">
                    <h2 className="text-lg font-extrabold text-white">Coordenação do DCE</h2>
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
                                <h3 className="mt-4 text-base font-extrabold text-slate-900">{p.name}</h3>
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

                                <h3 className="mt-6 text-lg font-extrabold text-slate-900">{p.name}</h3>
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
