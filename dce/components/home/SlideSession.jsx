'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const BRAND = {
    navy: "#0B1F3B",     // azul escuro
    magenta: "#B0125B",  // rosa/magenta
    cream: "#F6F1E7",    // off-white (fundo)
}

const slides = [
    {
        image: "/images/home/slide-1.jpg",
        kicker: "DCE Honestino Guimarães",
        title: "Sua vida estudantil começa aqui",
        description:
            "A gente conecta estudantes com eventos, projetos, suporte e representação. Cola com a gente e participa de algo maior.",
        ctaLabel: "Ver projetos",
        ctaHref: "/projects",
    },
    {
        image: "/images/home/slide-2.jpg",
        kicker: "Comunidade • Acolhimento • Luta",
        title: "Eventos, apoio e oportunidades",
        description:
            "Divulgação de ações, editais, reuniões e iniciativas do campus — tudo em um só lugar.",
        ctaLabel: "Conhecer o DCE",
        ctaHref: "/about",
    },
]

export function SlideSession() {
    const plugin = useRef(Autoplay({ delay: 3200, stopOnInteraction: true }))

    const [api, setApi] = useState()
    const [active, setActive] = useState(0)

    useEffect(() => {
        if (!api) return

        const onSelect = () => setActive(api.selectedScrollSnap())
        onSelect()

        api.on("select", onSelect)
        return () => {
            api.off("select", onSelect)
        }
    }, [api])

    const current = slides[active]

    return (
        <section className="w-full">
            <div className="relative">
                <Carousel
                    setApi={setApi}
                    className="w-full h-[60vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-none"
                    plugins={[plugin.current]}
                >
                    <CarouselContent className="h-full ml-0">
                        {slides.map((s, index) => (
                            <CarouselItem key={index} className="h-full pl-0">
                                <Card className="h-full overflow-hidden rounded-none border-0 shadow-none p-0 m-0">
                                    <CardContent className="relative h-full p-0">
                                        <Image
                                            src={s.image}
                                            alt={`Slide ${index + 1}`}
                                            fill
                                            sizes="100vw"
                                            className="object-cover"
                                            priority={index === 0}
                                        />

                                        {/* véu/gradiente pra dar contraste no texto */}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    `linear-gradient(90deg,
                            rgba(11,31,59,0.55) 0%,
                            rgba(11,31,59,0.15) 45%,
                            rgba(11,31,59,0.70) 100%)`,
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="left-4 z-30 bg-white/85 hover:bg-white" />
                    <CarouselNext className="right-4 z-30 bg-white/85 hover:bg-white" />
                </Carousel>

                {/* Painel de texto animado (sync com slide) */}
                <div className="pointer-events-none absolute inset-0 z-20 flex items-end md:items-center md:justify-end p-4 md:p-8">
                    <div
                        key={active} // re-dispara animação quando muda
                        className="pointer-events-auto w-full md:w-[420px] animate-heroIn"
                        style={{
                            backgroundColor: "rgba(246,241,231,0.88)",
                            borderLeft: `6px solid ${BRAND.magenta}`,
                        }}
                    >
                        <div className="relative p-6 md:p-7">
                            {/* “blob” decorativo com cor da logo */}
                            <div
                                className="absolute -top-10 -right-10 h-28 w-28 blur-2xl opacity-40 animate-float"
                                style={{
                                    background: `radial-gradient(circle, ${BRAND.magenta} 0%, transparent 60%)`,
                                }}
                            />
                            <div
                                className="absolute -bottom-10 -left-10 h-28 w-28 blur-2xl opacity-35 animate-floatSlow"
                                style={{
                                    background: `radial-gradient(circle, ${BRAND.navy} 0%, transparent 62%)`,
                                }}
                            />

                            <p
                                className="text-xs font-semibold tracking-wide uppercase"
                                style={{ color: BRAND.navy }}
                            >
                                {current.kicker}
                            </p>

                            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold leading-tight">
                                <span style={{ color: BRAND.navy }}>{current.title}</span>
                            </h2>

                            <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-700">
                                {current.description}
                            </p>

                            <div className="mt-5 flex items-center gap-3">
                                <Button asChild className="font-semibold">
                                    <Link href={current.ctaHref}>{current.ctaLabel}</Link>
                                </Button>

                                {/* dots clicáveis */}
                                <div className="ml-auto flex items-center gap-2">
                                    {slides.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => api?.scrollTo(i)}
                                            className="h-2.5 w-2.5 rounded-full transition-transform"
                                            style={{
                                                backgroundColor: i === active ? BRAND.magenta : "rgba(11,31,59,0.25)",
                                                transform: i === active ? "scale(1.15)" : "scale(1)",
                                            }}
                                            aria-label={`Ir para slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* animações locais (sem config do Tailwind) */}
                <style jsx>{`
          @keyframes heroIn {
            from { opacity: 0; transform: translateX(16px) translateY(8px); }
            to   { opacity: 1; transform: translateX(0) translateY(0); }
          }
          .animate-heroIn {
            animation: heroIn 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-floatSlow { animation: float 8s ease-in-out infinite; }
        `}</style>
            </div>
        </section>
    )
}
