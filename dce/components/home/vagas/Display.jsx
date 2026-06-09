import Link from "next/link"
import { Briefcase, Building2, Clock, ChevronRight } from "lucide-react"

export function Display({ jobs = [] }) {
    const hasJobs = jobs.length > 0

    return (
        <section className="w-full bg-[#f3f1ff]">
            <div className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10">

                {/* Header */}
                <div className="mb-10">
                    <div className="mb-4 inline-flex items-center gap-2 border-b-4 border-[#2708ab] bg-[#fdf25a] px-4 py-2 shadow-[4px_4px_0_#2708ab]">
                        <Briefcase className="h-4 w-4 text-[#2708ab]" />
                        <h1 className="text-lg font-extrabold text-[#2708ab]">Junte-se a Nós</h1>
                    </div>
                    <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
                        O DCE é construído por estudantes, para estudantes. Cada vaga é uma oportunidade de
                        desenvolver habilidades, ampliar sua rede e deixar um legado na universidade.
                        Venha fazer parte desta gestão!
                    </p>
                </div>

                {/* Lista de vagas */}
                {!hasJobs ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#2708ab]/30 bg-white py-20 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                            <Briefcase className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">Nenhuma vaga aberta no momento</p>
                            <p className="mt-1 max-w-xs text-sm text-slate-500">
                                Fique de olho — em breve abriremos novas oportunidades de participação.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={String(job._id)}
                                className="rounded-2xl border-2 border-transparent bg-white p-6 transition-all duration-200 hover:border-[#2708ab] hover:shadow-[4px_4px_0_#2708ab]"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab] text-[#fdf25a]">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800">{job.title}</h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-3">
                                                {job.area && (
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Building2 className="h-3 w-3" />
                                                        {job.area}
                                                    </span>
                                                )}
                                                {job.workload && (
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {job.workload}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="self-start rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                        Aberta
                                    </span>
                                </div>

                                {job.description && (
                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Descrição</p>
                                        <p className="text-sm text-slate-600 whitespace-pre-line">{job.description}</p>
                                    </div>
                                )}

                                {job.requirements && (
                                    <div className="mt-4 border-t border-slate-100 pt-4">
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Requisitos</p>
                                        <p className="text-sm text-slate-600 whitespace-pre-line">{job.requirements}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-10 rounded-2xl border-2 border-[#2708ab] bg-[#2708ab] p-8 text-center text-white">
                    <p className="mb-1 text-xl font-extrabold">Interessado em alguma vaga?</p>
                    <p className="mb-5 text-sm text-blue-200">
                        Entre em contato conosco pelo formulário de contato ou pelas nossas redes sociais.
                    </p>
                    <Link
                        href="/home/contato"
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-[#fdf25a] bg-[#fdf25a] px-6 py-3 text-sm font-bold text-[#2708ab] shadow-[3px_3px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-0.5"
                    >
                        Entrar em contato
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

            </div>
        </section>
    )
}
