'use client'

import Image from "next/image"

const team = [
    { name: "Beatriz", role: "Presidenta", photo: "/images/team/beatriz.jpg" },
    { name: "Alcieris", role: "Vice-Presidente e Tesouraria", photo: "/images/team/alcieris.jpg" },
    { name: "Ana", role: "Secretário", photo: "/images/team/ana.jpg" },
    { name: "Francisco", role: "Coordenação de Comunicação & Imprensa", photo: "/images/team/francisco.jpg" },
    { name: "Pietra", role: "Coordenação de Comunicação & Imprensa", photo: "/images/team/pietra.jpg" },
    { name: "Ana Clara", role: "Coordenação de Assistência Estudantil", photo: "/images/team/ana-clara.jpg" },
    { name: "João", role: "Coordenação de Assistência Estudantil", photo: "" },
    { name: "Evy", role: "Coordenação de Cultura", photo: "/images/team/evy.jpg" },
    { name: "Felipe", role: "Coordenação de Movimento Estudantil", photo: "" },
    { name: "Daf", role: "Coordenação de Movimento Estudantil", photo: "/images/team/daf.jpg" },
    { name: "Sara", role: "Coordenação de Movimento Estudantil", photo: "/images/team/sara.jpg" },
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

                {/* espaçamento grande entre eles */}
                <div className="mt-10 flex flex-wrap justify-between gap-y-12 gap-x-7">
                    {team.map((p) => (
                        <article key={p.name} className="w-44 text-center">
                            <div className="relative h-44 w-44 mx-auto overflow-hidden rounded-full">
                                <Image src={p.photo} alt={p.name} fill className="object-cover" />
                            </div>

                            <h3 className="mt-6 text-lg font-extrabold text-slate-900">{p.name}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-700">{p.role}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>


    )
}
