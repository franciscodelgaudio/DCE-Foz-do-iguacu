'use client'

import { MemberSession } from "./MemberSession"
import { SlideSession } from "./SlideSession"

export function Display() {

    return (
        <>
            <SlideSession />
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">

                        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
                            Olá 👋 Nós somos o Diretório Central dos Estudantes!
                        </h2>

                        <p className="max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg md:justify-self-end">
                            Nossa missão é conectar você com uma comunidade vibrante de estudantes,
                            oferecendo recursos, eventos e suporte para enriquecer sua experiência
                            acadêmica. Junte-se a nós e faça parte de algo maior!
                        </p>

                    </div>
                </div>
            </section>
            <MemberSession />

        </>
    )
}