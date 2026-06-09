import Link from "next/link"
import { Briefcase, ArrowRight, Clock, Building2, ChevronRight } from "lucide-react"

const STATUS_LABELS = {
    open: "Aberta",
    closed: "Encerrada",
}

export function JoinUsSession({ jobs = [] }) {
    const openJobs = jobs.filter((j) => j.status === "open")
    const hasJobs = openJobs.length > 0

    return (
        <section className="w-full border-t-[5px] border-[#2708ab] bg-[#f3f1ff]">
            <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">

                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-[#2708ab]">Junte-se a Nós</h2>
                            <p className="text-xs text-slate-500">Faça parte do DCE e construa o futuro do centro acadêmico</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border-2 border-[#2708ab]/20 bg-white p-6 md:p-8">
                    <p className="text-slate-600 leading-relaxed">
                        O DCE é construído por estudantes, para estudantes. Cada vaga é uma oportunidade de
                        desenvolver habilidades, ampliar sua rede e deixar um legado na universidade.
                        Venha fazer parte desta gestão!
                    </p>
                </div>

                {!hasJobs ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#2708ab]/30 bg-white py-14 text-center">
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {openJobs.map((job) => (
                            <div
                                key={String(job._id)}
                                className="group flex flex-col rounded-xl border-2 border-transparent bg-white p-5 transition-all duration-200 hover:border-[#2708ab] hover:shadow-[4px_4px_0_#2708ab]"
                            >
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2708ab] text-[#fdf25a]">
                                        <Briefcase className="h-4 w-4" />
                                    </div>
                                    <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                        Aberta
                                    </span>
                                </div>

                                <h3 className="font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#2708ab]">
                                    {job.title}
                                </h3>

                                {job.area && (
                                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                                        <Building2 className="h-3 w-3 shrink-0" />
                                        <span>{job.area}</span>
                                    </div>
                                )}

                                {job.workload && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="h-3 w-3 shrink-0" />
                                        <span>{job.workload}</span>
                                    </div>
                                )}

                                {job.description && (
                                    <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                                        {job.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {hasJobs && (
                    <div className="mt-8 rounded-2xl border-2 border-[#2708ab] bg-[#2708ab] p-6 text-center text-white">
                        <p className="mb-1 text-lg font-extrabold">Interessado em alguma vaga?</p>
                        <p className="mb-4 text-sm text-blue-200">
                            Entre em contato conosco pelo formulário de contato ou pelas nossas redes sociais.
                        </p>
                        <Link
                            href="/home/contato"
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-[#fdf25a] bg-[#fdf25a] px-5 py-2.5 text-sm font-bold text-[#2708ab] shadow-[3px_3px_0_rgba(255,255,255,0.3)] transition-transform hover:-translate-y-0.5"
                        >
                            Entrar em contato
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}

            </div>
        </section>
    )
}
