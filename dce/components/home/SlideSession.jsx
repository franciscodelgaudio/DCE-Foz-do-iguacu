'use client'

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import { AnimatePresence, motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const slides = [
    {
        text: "DCE em movimento",
        type: "image",
        src: "/images/home/WhatsApp Image 2026-06-16 at 15.42.36.jpeg",
        alt: "Integrantes do DCE em evento com decoracao azul e amarela",
    },
    {
        text: "Representação estudantil presente",
        type: "image",
        src: "/images/home/692556983_18588561442061232_7390780632962570418_n.jpg",
        alt: "Reunião do DCE com estudantes e representantes",
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
                                        {s.type === "video" ? (
                                            <video
                                                className="h-full w-full object-cover"
                                                src={s.src}
                                                poster={s.poster}
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata"
                                                aria-label={`Slide ${index + 1}: ${s.text}`}
                                            />
                                        ) : (
                                            <Image
                                                src={s.src}
                                                alt={s.alt || `Slide ${index + 1}`}
                                                fill
                                                sizes="100vw"
                                                className="object-cover"
                                                priority={index === 0}
                                            />
                                        )}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    `linear-gradient(90deg,
                            rgba(0,0,0,0.55) 0%,
                            rgba(0,0,0,0.15) 45%,
                            rgba(0,0,0,0.70) 100%)`,
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

                <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-start px-8 md:px-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current.text}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                            className="pointer-events-auto"
                        >
                            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#fdf25a]">
                                DCE - UNIOESTE Foz
                            </p>
                            <div
                                className="border-l-4 border-[#fdf25a] pl-4 text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg"
                            >
                                {current.text}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
