import {
    FileDown,
    GraduationCap,
    Shield,
    Vote,
    Megaphone,
    BookOpen,
    Music,
    ChevronDown,
    Building2,
    Users,
    Palette,
} from "lucide-react"

export const metadata = {
    title: "Sobre o DCE | DCE UNIOESTE Foz",
    description:
        "Conheça o Diretório Central dos Estudantes da UNIOESTE Foz do Iguaçu — o que é, como funciona e quais são seus direitos.",
}

/* ─────────────────────────────────────────────
   Infographic 1 — Hierarchy: Students → CAs → DCE
───────────────────────────────────────────── */
function HierarchyDiagram() {
    const sampleCas = [
        { sigla: "CADU", curso: "Direito" },
        { sigla: "CAL", curso: "Letras" },
        { sigla: "CAEE", curso: "Engenharia Elétrica" },
        { sigla: "CATUR", curso: "Turismo" },
    ]

    return (
        <div className="w-full">
            {/* DCE — top */}
            <div className="flex justify-center">
                <div className="w-full max-w-sm rounded-2xl border-4 border-[#fdf25a] bg-[#2708ab] px-6 py-6 text-center text-white shadow-[6px_6px_0_#fdf25a]">
                    <Building2 className="mx-auto mb-2 size-10" strokeWidth={1.5} />
                    <p className="text-2xl font-extrabold tracking-tight">DCE UNIOESTE FOZ</p>
                    <p className="mt-1 text-sm text-blue-200">Diretório Central dos Estudantes</p>
                    <span className="mt-3 inline-block rounded-full bg-[#fdf25a] px-4 py-1 text-xs font-extrabold text-[#2708ab]">
                        Representa TODOS os estudantes
                    </span>
                </div>
            </div>

            {/* Connector label */}
            <div className="mx-auto my-1 flex flex-col items-center">
                <div className="h-6 w-px bg-[#2708ab]" />
                <span className="rounded border border-[#2708ab] bg-blue-50 px-3 py-0.5 text-[11px] font-semibold text-[#2708ab]">
                    articula e representa
                </span>
                <div className="h-6 w-px bg-[#2708ab]" />
            </div>

            {/* CAs row — 4 samples + "+10 mais" */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {sampleCas.map((ca, i) => (
                    <div
                        key={i}
                        className="rounded-xl border-2 border-[#2708ab] bg-[#fdf25a] p-3 text-center shadow-[2px_2px_0_#2708ab]"
                    >
                        <GraduationCap
                            className="mx-auto mb-1 size-6 text-[#2708ab]"
                            strokeWidth={1.5}
                        />
                        <p className="text-sm font-extrabold text-[#2708ab]">{ca.sigla}</p>
                        <p className="text-[10px] font-medium leading-tight text-[#2708ab]">{ca.curso}</p>
                        <p className="mt-1 text-[10px] text-zinc-600">Representa um curso</p>
                    </div>
                ))}

                {/* "+ 10 mais" block */}
                <div className="col-span-2 flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#2708ab] bg-blue-50 p-3 text-center sm:col-span-1">
                    <div>
                        <p className="text-2xl font-extrabold text-[#2708ab]">+10</p>
                        <p className="text-xs font-bold leading-tight text-[#2708ab]">Centros Acadêmicos</p>
                        <p className="mt-1 text-[10px] text-zinc-500">14 CAs no total</p>
                    </div>
                </div>
            </div>

            {/* Connector label */}
            <div className="mx-auto my-1 flex flex-col items-center">
                <div className="h-6 w-px bg-zinc-400" />
                <span className="rounded border border-zinc-300 bg-zinc-50 px-3 py-0.5 text-[11px] font-semibold text-zinc-500">
                    formados por
                </span>
                <div className="h-6 w-px bg-zinc-400" />
            </div>

            {/* Students */}
            <div className="flex justify-center">
                <div className="w-full max-w-sm rounded-2xl border-2 border-zinc-300 bg-zinc-50 px-6 py-5 text-center">
                    <div className="mb-2 flex justify-center gap-1 text-2xl">
                        {["👩‍🎓", "👨‍🎓", "👩‍🎓", "👨‍🎓", "👩‍🎓"].map((e, i) => (
                            <span key={i}>{e}</span>
                        ))}
                    </div>
                    <p className="font-bold text-zinc-700">Estudantes da UNIOESTE Foz</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Todos são membros automáticos do DCE
                    </p>
                </div>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Infographic 2 — DCE internal structure
───────────────────────────────────────────── */
function OrgDiagram() {
    const levels = [
        {
            icon: <Vote className="size-8" strokeWidth={1.5} />,
            title: "Assembleia Geral",
            badge: "PODER SOBERANO",
            badgeClass: "bg-[#fdf25a] text-[#2708ab]",
            desc: "Todos os estudantes têm voz e voto. É a instância máxima de decisão: define diretrizes, aprova contas, reforma o estatuto e pode destituir membros.",
            wrapClass:
                "bg-[#2708ab] text-white border-4 border-[#fdf25a] shadow-[5px_5px_0_#fdf25a]",
        },
        {
            icon: <Users className="size-8" strokeWidth={1.5} />,
            title: "Conselho das Entidades de Base (CEB)",
            badge: "FISCALIZAÇÃO",
            badgeClass: "bg-[#2708ab] text-white",
            desc: "Composto por representantes de cada Centro Acadêmico. Fiscaliza a Diretoria, delibera sobre questões estratégicas e pode convocar a Assembleia Geral.",
            wrapClass:
                "bg-[#fdf25a] text-[#2708ab] border-2 border-[#2708ab] shadow-[4px_4px_0_#2708ab]",
        },
        {
            icon: <Building2 className="size-8" strokeWidth={1.5} />,
            title: "Diretoria do DCE",
            badge: "EXECUÇÃO",
            badgeClass: "bg-[#fdf25a] text-[#2708ab]",
            desc: "Órgão executivo: conduz o dia a dia do DCE. Composta por Presidência, Vice, Secretaria, Tesouraria e Coordenações de Comunicação, Cultura, Assistência Estudantil, Ensino e Movimento Estudantil.",
            wrapClass:
                "bg-white text-[#2708ab] border-2 border-[#2708ab] shadow-[4px_4px_0_#2708ab]",
        },
    ]

    return (
        <div className="mx-auto w-full max-w-xl space-y-1 px-4">
            {levels.map((level, i) => (
                <div key={i}>
                    <div className={`rounded-2xl p-5 ${level.wrapClass}`}>
                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 shrink-0">{level.icon}</div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-base font-extrabold">{level.title}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${level.badgeClass}`}
                                    >
                                        {level.badge}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed opacity-90">
                                    {level.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                    {i < levels.length - 1 && (
                        <div className="flex justify-center py-1">
                            <ChevronDown className="size-6 text-[#2708ab]" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function Page() {
    const objectives = [
        {
            icon: <Shield className="size-5" />,
            title: "Defende seus direitos",
            desc: "Atua na defesa dos interesses coletivos e individuais de todos os estudantes perante a universidade e demais instâncias.",
        },
        {
            icon: <Megaphone className="size-5" />,
            title: "Representa os estudantes",
            desc: "Representa os discentes perante todos os órgãos e instâncias institucionais da UNIOESTE, judicial e extrajudicialmente.",
        },
        {
            icon: <BookOpen className="size-5" />,
            title: "Informa a comunidade",
            desc: "Mantém os estudantes informados sobre assuntos de interesse geral da categoria acadêmica, incluindo jornal e redes sociais.",
        },
        {
            icon: <GraduationCap className="size-5" />,
            title: "Fortalece o ensino",
            desc: "Incentiva e defende a permanência estudantil e os três pilares da universidade: Ensino, Pesquisa e Extensão.",
        },
        {
            icon: <Palette className="size-5" />,
            title: "Promove cultura",
            desc: "Organiza atividades culturais, artísticas, esportivas e de lazer, fortalecendo a identidade e integração estudantil.",
        },
        {
            icon: <Vote className="size-5" />,
            title: "Exercita a democracia",
            desc: "Contribui para o exercício da democracia no campus, promovendo formação política e cidadã entre os estudantes.",
        },
    ]

    const rights = [
        "Participar, propor, discutir e votar nas Assembleias Gerais ordinárias e extraordinárias",
        "Votar e ser votado nos processos eleitorais, obedecendo aos critérios do regulamento eleitoral",
        "Apresentar propostas e reivindicações aos poderes sociais do DCE",
        "Ter acesso às informações sobre contas, atividades, documentos públicos e decisões do DCE",
        "Recorrer de decisões que lhe afetem diretamente, conforme os procedimentos do Estatuto",
    ]

    return (
        <main className="w-full">
            {/* ── Hero ── */}
            <section className="bg-[#2708ab] text-white">
                <div className="mx-auto max-w-4xl px-6 py-20 text-center">
                    <span className="mb-4 inline-block rounded-full border-2 border-[#fdf25a] px-4 py-1 text-sm font-bold text-[#fdf25a]">
                        CONHEÇA O DCE
                    </span>
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                        O que é o DCE?
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-200">
                        O Diretório Central dos Estudantes é a entidade máxima de representação dos
                        estudantes da UNIOESTE Foz do Iguaçu. Se você estuda aqui, você já faz parte!
                    </p>
                </div>
            </section>

            {/* ── O que é ── */}
            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-[#2708ab] md:text-4xl">
                                Uma associação de todos os estudantes
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-zinc-600">
                                O <strong>DCE UNIOESTE FOZ</strong> é uma associação civil, sem fins
                                lucrativos, suprapartidária e laica. Representa todos os estudantes
                                regularmente matriculados nos cursos de graduação e pós-graduação da
                                UNIOESTE – Campus Foz do Iguaçu.
                            </p>
                            <p className="mt-3 text-base leading-relaxed text-zinc-600">
                                Você não precisa se inscrever: se é estudante da UNIOESTE em Foz,{" "}
                                <strong>você já é membro do DCE</strong> e tem todos os direitos
                                garantidos pelo estatuto.
                            </p>
                            <p className="mt-3 text-base leading-relaxed text-zinc-600">
                                O DCE é regido pelo seu Estatuto e tem sede no Campus Jardim
                                Universitário, mas representa estudantes dos dois campi de Foz do Iguaçu.
                            </p>
                        </div>

                        {/* Key facts card */}
                        <div className="rounded-2xl border-2 border-[#2708ab] bg-[#fdf25a] p-6 shadow-[5px_5px_0_#2708ab]">
                            <p className="mb-4 text-sm font-extrabold uppercase tracking-widest text-[#2708ab]">
                                O DCE em destaque
                            </p>
                            <div className="space-y-4">
                                {[
                                    {
                                        ref: "Art. 1º",
                                        text: "Associação civil, sem fins lucrativos e suprapartidária",
                                    },
                                    {
                                        ref: "Art. 3º",
                                        text: "Todos os alunos de graduação e pós-graduação são membros automáticos",
                                    },
                                    {
                                        ref: "9 coordenações",
                                        text: "Comunicação, Cultura, Tesouraria, Assistência Estudantil e mais",
                                    },
                                    {
                                        ref: "Art. 35",
                                        text: "Presidente eleito por mandato de 1 ano, com possibilidade de reeleição",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="shrink-0 rounded-full bg-[#2708ab] px-3 py-1 text-xs font-extrabold text-white">
                                            {item.ref}
                                        </span>
                                        <p className="text-sm leading-relaxed text-[#2708ab]">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Hierarchy Infographic ── */}
            <section className="bg-zinc-50">
                <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#2708ab] md:text-4xl">
                            A estrutura de representação
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600">
                            Os Centros Acadêmicos (CAs) representam cada curso individualmente. O DCE
                            está acima deles, congregando e representando <strong>todos</strong> os
                            estudantes do campus de uma só vez.
                        </p>
                    </div>
                    <HierarchyDiagram />

                    {/* Callout */}
                    <div className="mx-auto mt-10 max-w-2xl rounded-2xl border-2 border-[#2708ab] bg-[#2708ab] px-6 py-5 text-center text-white">
                        <p className="text-base font-bold">
                            💡 Não tem CA no seu curso?
                        </p>
                        <p className="mt-1 text-sm text-blue-200">
                            Mesmo assim, o DCE te representa! Fale com a gente para saber como
                            organizar um Centro Acadêmico no seu curso.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── O que fazemos ── */}
            <section className="bg-white">
                <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
                    <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#2708ab] md:text-4xl">
                        O que o DCE faz por você
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {objectives.map((obj, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border-2 border-zinc-200 p-6 transition-all hover:border-[#2708ab] hover:shadow-[4px_4px_0_#2708ab]"
                            >
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2708ab] text-white">
                                    {obj.icon}
                                </div>
                                <h3 className="font-extrabold text-[#2708ab]">{obj.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                                    {obj.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Org Diagram ── */}
            <section className="bg-zinc-50">
                <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#2708ab] md:text-4xl">
                            Como o DCE é organizado
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600">
                            O poder vem dos estudantes. A Assembleia Geral é soberana, o CEB fiscaliza
                            e a Diretoria coloca tudo em prática.
                        </p>
                    </div>
                    <OrgDiagram />
                </div>
            </section>

            {/* ── Seus direitos ── */}
            <section className="bg-white">
                <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
                    <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-[#2708ab] md:text-4xl">
                        Seus direitos como estudante
                    </h2>
                    <div className="space-y-3">
                        {rights.map((right, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 rounded-xl border-2 border-zinc-200 p-4 transition-colors hover:border-[#2708ab]"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#2708ab] bg-[#fdf25a] text-sm font-extrabold text-[#2708ab]">
                                    {i + 1}
                                </span>
                                <p className="text-sm leading-relaxed text-zinc-700">{right}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-5 text-center text-xs text-zinc-400">
                        Direitos previstos no Art. 5º do Estatuto do DCE UNIOESTE FOZ
                    </p>
                </div>
            </section>

            {/* ── Download Estatuto ── */}
            <section className="bg-[#2708ab]">
                <div className="mx-auto max-w-4xl px-6 py-16 text-center md:px-10">
                    <FileDown
                        className="mx-auto mb-4 size-14 text-[#fdf25a]"
                        strokeWidth={1.5}
                    />
                    <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                        Leia o Estatuto completo
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-blue-200">
                        O Estatuto é o documento que rege o funcionamento do DCE. Aprovado em
                        Assembleia Geral em 29 de setembro de 2025 pela Gestão Conceição Evaristo.
                    </p>
                    <a
                        href="/estatuto-dce-2025.pdf"
                        download
                        className="mt-8 inline-flex items-center gap-3 rounded-xl border-4 border-[#fdf25a] bg-[#fdf25a] px-8 py-4 text-lg font-extrabold text-[#2708ab] shadow-[4px_4px_0_rgba(255,255,255,0.4)] transition-all hover:bg-[#fff86f] hover:shadow-[6px_6px_0_rgba(255,255,255,0.4)]"
                    >
                        <FileDown className="size-6" />
                        Baixar Estatuto 2025 (PDF)
                    </a>
                    <p className="mt-4 text-sm text-blue-300">
                        Gestão Conceição Evaristo · Aprovado em 29/09/2025
                    </p>
                </div>
            </section>
        </main>
    )
}
