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

export function SlideSession() {

    const plugin = useRef(Autoplay({ delay: 2000 }))

    return (
        <Carousel
            className="w-full h-[60vh] min-h-[320px] max-h-[520px] overflow-hidden rounded-none"
            plugins={[plugin.current]}
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
    )
}