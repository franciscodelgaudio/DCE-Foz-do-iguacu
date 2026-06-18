import { UserPlus, Briefcase } from "lucide-react"
import { Job } from "@/models/job"
import { InscricaoCargoForm } from "@/components/home/InscricaoCargoForm"

export const metadata = {
    title: "Inscrição de Cargo | DCE UNIOESTE Foz",
    description: "Quer fazer parte do DCE UNIOESTE Foz do Iguaçu? Preencha o formulário e candidate-se a um cargo na nossa gestão.",
}

export default async function InscricaoCargoPage() {
    const jobs = await Job.find({ status: "open" }).sort({ createdAt: -1 }).lean()
    const jobsData = JSON.parse(JSON.stringify(jobs))

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

                    {/* Lista de cargos disponíveis */}
                    <div className="lg:col-span-2">
                        <p className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-400">
                            Cargos disponíveis
                        </p>

                        {jobsData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#2708ab]/30 bg-white py-12 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf25a] text-[#2708ab] shadow-[2px_2px_0_#2708ab]">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700">Nenhum cargo aberto no momento</p>
                                    <p className="mt-1 max-w-xs text-sm text-slate-500">
                                        Acompanhe nossas redes para saber quando abrirmos novas vagas.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {jobsData.map((job) => (
                                    <div
                                        key={job._id}
                                        className="flex items-start gap-4 rounded-2xl border-2 border-[#2708ab]/15 bg-white p-4"
                                    >
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2708ab]/10">
                                            <UserPlus className="h-4 w-4 text-[#2708ab]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[#2708ab]">{job.title}</p>
                                            {job.area && (
                                                <p className="mt-0.5 text-xs font-semibold text-slate-500">{job.area}</p>
                                            )}
                                            {job.description && (
                                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{job.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

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
                            <InscricaoCargoForm jobs={jobsData} />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
