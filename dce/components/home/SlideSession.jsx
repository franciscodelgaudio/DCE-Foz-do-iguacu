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

const BRAND = {
    indigo: "#2708ab",
    indigoDark: "#16045f",
    yellow: "#fdf25a",
}

const slides = [
    {
        text: "Sua voz no campus",
        image: "/images/home/slide-1.jpg"
    },
    {
        text: "Sua vida acadêmica começa aqui",
        image: "/images/home/slide-2.jpg"
    }
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

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">

                    <AnimatePresence mode="wait">
                        <motion.span
                            key={current.text}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                            className="block text-5xl md:text-6xl font-bold leading-none text-[#2708ab]"
                        >
                            <div
                                className="pointer-events-auto translate-y-1/2 border-b-4 border-[#2708ab] px-10 py-3 shadow-[0_10px_0_rgba(39,8,171,0.18)]"
                                style={{
                                    backgroundColor: BRAND.yellow,
                                    textShadow: "0 2px 0 rgba(255,255,255,0.55)",
                                }}
                            >
                                {current.text}
                            </div>
                        </motion.span>
                    </AnimatePresence>

                </div>
            </div>
        </section>
    )
}
