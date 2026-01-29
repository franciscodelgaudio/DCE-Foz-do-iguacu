'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { useRef } from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"

const slides = [
    "/images/home/slide-1.jpg",
    "/images/home/slide-2.jpg",
]

const team = [
    { name: "Ana Clara", role: "Coordenação Geral", photo: "/images/team/ana-clara.jpg" },
    { name: "Francisco", role: "Comunicação", photo: "/images/team/francisco.jpg" },
    { name: "Pietra", role: "Comunicação", photo: "/images/team/pietra.jpg" },
    { name: "André", role: "Eventos", photo: "/images/team/andre.jpg" },
    { name: "Beatriz", role: "Presidenta", photo: "/images/team/beatriz.jpg" },
    { name: "Alcieris", role: "Vice-Presidente", photo: "/images/team/alcieris.jpg" },
]

export function Display() {

    const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }))

    return (
        <>
            <Carousel
                className="w-full h-[60vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-none"
                plugins={[plugin.current]}
                onMouseEnter={() => plugin.current.stop()}
                onMouseLeave={() => plugin.current.reset()}
            >
                <CarouselContent className="h-full ml-0">
                    {slides.map((src, index) => (
                        <CarouselItem key={index} className="h-full pl-0">
                            <Card className="h-full overflow-hidden rounded-none border-0 shadow-none p-0 m-0">
                                <CardContent className="relative h-full">
                                    <Image
                                        src={src}
                                        alt={`Slide ${index + 1}`}
                                        fill
                                        sizes="100vw"
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

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

            <section className="w-full">
                <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
                    {/* “chip” do título (igual print) */}
                    <div className="inline-flex bg-slate-900 px-4 py-2">
                        <h2 className="text-lg font-extrabold text-white">
                            Coordenação do DCE
                        </h2>
                    </div>

                    {/* grid dos membros */}
                    <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
                        {team.map((p) => (
                            <article key={p.name} className="min-w-0">
                                <div className="relative h-44 w-44 max-w-full">
                                    {/* wrapper pra foto ficar redonda */}
                                    <div className="relative h-44 w-44 overflow-hidden rounded-full">
                                        <Image
                                            src={p.photo}
                                            alt={p.name}
                                            fill
                                            sizes="(min-width: 1024px) 160px, (min-width: 640px) 160px, 50vw"
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                <h3 className="mt-6 text-lg font-extrabold text-slate-900">
                                    {p.name}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                                    {p.role}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}