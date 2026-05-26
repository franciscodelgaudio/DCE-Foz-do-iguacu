import Image from "next/image"

const partners = [
    {
        name: "CSME",
        logo: "/images/partners/CSME.jpg",
        url: null,
    },
    {
        name: "CAEE",
        logo: "/images/partners/CAEE.jpg",
        url: null,
    },
]

function LogoPlaceholder({ name }) {
    return (
        <div className="flex h-20 w-40 items-center justify-center rounded-xl border-2 border-dashed border-[#2708ab]/30 bg-[#f3f1ff]">
            <span className="text-sm font-bold text-[#2708ab]/40">{name}</span>
        </div>
    )
}

export function PartnersSession() {
    return (
        <section className="w-full border-t-[5px] border-[#2708ab] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">

                <div className="mb-8 text-center">
                    <span className="inline-block rounded-full border-2 border-[#2708ab] px-3 py-1 text-xs font-bold text-[#2708ab]">
                        PARCEIROS
                    </span>
                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#2708ab] md:text-3xl">
                        Instituições <span className="bg-[#fdf25a] px-1">Parceiras</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Entidades e organizações que apoiam o DCE UNIOESTE Foz
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-12">
                    {partners.map((partner) => (
                        <div key={partner.name} className="flex flex-col items-center gap-2">
                            {partner.logo ? (
                                <div className="relative h-16 w-32">
                                    <Image
                                        src={partner.logo}
                                        alt={`Logo ${partner.name}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <LogoPlaceholder name={partner.name} />
                            )}
                            <span className="text-xs font-bold text-[#2708ab]">{partner.name}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
