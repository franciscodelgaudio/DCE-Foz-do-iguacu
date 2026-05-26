import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"

export function CorreioEleganteBanner() {
    return (
        <section className="w-full border-b border-[#be123c]/20 bg-gradient-to-r from-[#9f1239] to-[#e11d48]">
            <div className="mx-auto max-w-6xl px-6 py-6 md:px-10">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#be123c] shadow-[3px_3px_0_rgba(0,0,0,0.2)]">
                            <Heart className="h-6 w-6 fill-current" />
                        </div>
                        <div className="text-white">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-lg font-extrabold">Correio Elegante 💌</span>
                                <span className="rounded-full bg-[#fdf25a] px-2 py-0.5 text-xs font-bold text-[#9f1239]">
                                    Aberto!
                                </span>
                            </div>
                            <p className="text-sm text-rose-200">
                                Entrega 12/jun · A partir de R$ 3,00
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/home/correio-elegante"
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#be123c] shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5"
                    >
                        Fazer pedido
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
