'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createOrder } from "@/lib/actions/correioElegante"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Copy, Check, ArrowLeft, User, MessageSquare, Phone, EyeOff, Mail } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

const PKG_DISPLAY = [
    {
        key: "cartinha",
        emoji: "💌",
        label: "Cartinha",
        price: "R$ 2,50",
        items: ["1 cartinha personalizada"],
    },
    {
        key: "rosa",
        emoji: "🌹💌",
        label: "Rosa + Cartinha",
        price: "R$ 6,00",
        items: ["1 rosa", "1 cartinha personalizada"],
    },
    {
        key: "bombom_cartinha",
        emoji: "🍬💌",
        label: "Bombom + Cartinha",
        price: "R$ 5,00",
        items: ["1 bombom", "1 cartinha personalizada"],
    },
    {
        key: "bombom_cartinha_rosa",
        emoji: "🍬💌🌹",
        label: "Bombom + Cartinha + Rosa",
        price: "R$ 8,50",
        items: ["1 bombom", "1 cartinha personalizada", "1 rosa"],
        highlight: true,
    },
]


const formSchema = z.object({
    senderName: z.string().min(2, "Mínimo 2 caracteres"),
    senderContact: z
        .string()
        .refine((value) => onlyDigits(value).length === 11, "Informe um WhatsApp válido com DDD"),
    recipientName: z.string().min(2, "Mínimo 2 caracteres"),
    recipientCourse: z.string().min(1, "Campo obrigatório"),
    recipientYear: z.string().min(1, "Campo obrigatório"),
    package: z.enum(["cartinha", "rosa", "bombom_cartinha", "bombom_cartinha_rosa"]),
    cardMessage: z.string().max(500).optional(),
    isAnonymous: z.boolean().optional(),
    senderEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

function onlyDigits(value) {
    return String(value ?? "").replace(/\D/g, "")
}

function formatBrazilWhatsapp(value) {
    const digits = onlyDigits(value).slice(0, 11)
    const ddd = digits.slice(0, 2)
    const firstPart = digits.slice(2, 7)
    const secondPart = digits.slice(7, 11)

    if (digits.length <= 2) return ddd ? `(${ddd}` : ""
    if (digits.length <= 7) return `(${ddd}) ${firstPart}`
    return `(${ddd}) ${firstPart} - ${secondPart}`
}

function crc16(str) {
    let crc = 0xFFFF
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

function emv(id, value) {
    const v = String(value)
    return `${id}${String(v.length).padStart(2, '0')}${v}`
}

function buildPixPayload(pixKey, merchantName, amountNum, txid) {
    const mai = emv('26', emv('00', 'BR.GOV.BCB.PIX') + emv('01', pixKey))
    const name = merchantName.normalize('NFD').replace(/[̀-ͯ]/g, '').substring(0, 25).toUpperCase()
    const txidClean = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'CORREIOELEGANTE'
    const body = [
        '000201', '010211', mai,
        '52040000', '5303986',
        emv('54', amountNum.toFixed(2)),
        '5802BR',
        emv('59', name),
        emv('60', 'CASCAVEL'),
        emv('62', emv('05', txidClean)),
        '6304',
    ].join('')
    return body + crc16(body)
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)
    function handleCopy() {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <button
            onClick={handleCopy}
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#be123c]/10 px-2 py-1 text-xs font-semibold text-[#be123c] transition hover:bg-[#be123c]/20"
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado!" : "Copiar"}
        </button>
    )
}

function SuccessScreen({ orderNumber, price, packageLabel, pixKey, pixKeyType, pixRecipientName, onReset }) {
    const amountNum = parseFloat(price.replace(',', '.'))
    const pixPayload = pixKey
        ? buildPixPayload(pixKey, pixRecipientName || 'DCE UNIOESTE', amountNum, orderNumber)
        : null

    return (
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf25a] text-[#be123c] shadow-[4px_4px_0_#be123c]">
                    <Heart className="h-10 w-10 fill-current" />
                </div>
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-[#be123c]">Pedido recebido!</h2>
            <p className="mb-8 text-slate-600">
                Agora é só pagar via PIX para confirmar. Assim que identificarmos seu pagamento, entraremos em contato.
            </p>

            <div className="mb-6 rounded-2xl border-2 border-[#be123c]/20 bg-rose-50 p-6 text-left">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Nº do pedido</span>
                    <span className="rounded-full bg-[#be123c] px-3 py-0.5 text-sm font-bold text-white">{orderNumber}</span>
                </div>
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">Pacote</span>
                    <span className="text-sm font-bold text-slate-800">{packageLabel}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#be123c]/20 pt-4">
                    <span className="text-sm font-semibold text-slate-500">Valor</span>
                    <span className="text-xl font-extrabold text-[#be123c]">R$ {price}</span>
                </div>
            </div>

            {pixKey ? (
                <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-left">
                    <p className="mb-4 text-sm font-bold text-emerald-800">Pague via PIX</p>
                    {pixPayload && (
                        <>
                            <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-100 px-3 py-2 text-xs">
                                <span className="font-semibold text-emerald-700">Nº do pedido no PIX</span>
                                <span className="font-mono font-bold text-emerald-900">{orderNumber}</span>
                            </div>
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-2xl border-2 border-emerald-200 bg-white p-3 shadow-sm">
                                    <QRCodeSVG value={pixPayload} size={180} />
                                </div>
                            </div>
                            <div className="mb-1.5 flex items-center justify-center gap-2">
                                <span className="text-xs font-semibold text-emerald-700">PIX Copia e Cola</span>
                                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                                    Valor travado · R$ {price}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2">
                                <span className="mr-2 truncate font-mono text-xs text-slate-500">
                                    {pixPayload.substring(0, 32)}…
                                </span>
                                <CopyButton text={pixPayload} />
                            </div>
                        </>
                    )}
                    <p className="mt-3 text-xs text-emerald-700 text-center">
                        Escaneie o QR code ou use o Copia e Cola acima. O nº do pedido está identificado no PIX.
                    </p>
                </div>
            ) : (
                <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    As informações de pagamento serão divulgadas em breve pelo DCE.
                </div>
            )}

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Próximos passos:</p>
                <ol className="list-inside list-decimal space-y-1.5">
                    <li>Realize o pagamento via PIX no valor indicado</li>
                    <li>O DCE confirmará o pagamento e entrará em contato</li>
                    <li>Seu Correio Elegante será entregue no dia <strong>12 de junho</strong></li>
                </ol>
            </div>

            <button
                onClick={onReset}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#be123c] underline-offset-2 hover:underline"
            >
                <ArrowLeft className="h-4 w-4" />
                Fazer outro pedido
            </button>
        </div>
    )
}

export function Display({ isEnabled, pixKey, pixKeyType, pixRecipientName }) {
    const [selectedPackage, setSelectedPackage] = useState(null)
    const [successData, setSuccessData] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
    })

    const watchedPackage = watch("package")
    const senderContactValue = watch("senderContact") ?? ""
    const senderContactField = register("senderContact")

    function handleSelectPackage(key) {
        setSelectedPackage(key)
        setValue("package", key, { shouldValidate: true })
    }

    async function onSubmit(data) {
        setIsSubmitting(true)
        setServerError(null)
        const result = await createOrder(data)
        setIsSubmitting(false)
        if (!result.success) {
            setServerError(result.message)
            return
        }
        setSuccessData(result)
    }

    function handleReset() {
        setSuccessData(null)
        setSelectedPackage(null)
        setServerError(null)
        reset()
    }

    if (successData) {
        return (
            <div className="min-h-screen bg-rose-50">
                <SuccessScreen
                    orderNumber={successData.orderNumber}
                    price={successData.price}
                    packageLabel={successData.packageLabel}
                    pixKey={pixKey}
                    pixKeyType={pixKeyType}
                    pixRecipientName={pixRecipientName}
                    onReset={handleReset}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-rose-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#9f1239] to-[#e11d48] px-6 py-14 text-center text-white">
                <div className="mx-auto max-w-2xl">
                    <h1 className="mb-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                        Correio Elegante
                    </h1>
                    <p className="mb-6 text-rose-200 text-lg">
                        Surpreenda alguém especial com uma mensagem e um presentinho carinhoso do DCE!
                    </p>
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold backdrop-blur-sm">
                        <span>🎁 Entrega: <strong>12 de junho</strong></span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-12">
                {/* Packages */}
                <div className="mb-10">
                    <h2 className="mb-1 text-xl font-extrabold text-[#be123c]">Escolha o pacote</h2>
                    <p className="mb-5 text-sm text-slate-500">Selecione o que você quer enviar</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PKG_DISPLAY.map((pkg) => (
                            <button
                                key={pkg.key}
                                type="button"
                                onClick={() => handleSelectPackage(pkg.key)}
                                className={[
                                    "relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-200",
                                    watchedPackage === pkg.key
                                        ? "border-[#be123c] bg-white shadow-[4px_4px_0_#be123c]"
                                        : "border-slate-200 bg-white hover:border-[#be123c]/40 hover:shadow-md",
                                ].join(" ")}
                            >
                                {pkg.highlight && (
                                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#fdf25a] px-3 py-0.5 text-xs font-bold text-[#9f1239] shadow-[2px_2px_0_#9f1239]">
                                        Mais completo
                                    </span>
                                )}
                                <span className="mb-2 text-3xl">{pkg.emoji}</span>
                                <p className="mb-1 font-bold text-slate-800">{pkg.label}</p>
                                <ul className="mb-3 space-y-0.5 text-xs text-slate-500">
                                    {pkg.items.map((item) => (
                                        <li key={item}>• {item}</li>
                                    ))}
                                </ul>
                                <p className="mt-auto text-xl font-extrabold text-[#be123c]">{pkg.price}</p>
                                {watchedPackage === pkg.key && (
                                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#be123c]">
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    {errors.package && (
                        <p className="mt-2 text-sm text-red-500">{errors.package.message}</p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Sender */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-[#be123c]" />
                                <h3 className="font-bold text-slate-800">Quem está enviando</h3>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-sm select-none hover:bg-slate-100">
                                <input
                                    type="checkbox"
                                    {...register("isAnonymous")}
                                    className="size-4 accent-[#be123c]"
                                />
                                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                                    Enviar anonimamente
                                </span>
                            </label>
                        </div>
                        {watch("isAnonymous") && (
                            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                Seu nome <strong>não aparecerá no cartão</strong>, mas seus dados abaixo são necessários para confirmarmos o pagamento.
                            </p>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="senderName">
                                    Seu nome{" "}
                                    <span className="text-xs font-normal text-slate-400">(apenas para o DCE)</span>
                                </Label>
                                <Input
                                    id="senderName"
                                    placeholder="Nome completo"
                                    {...register("senderName")}
                                    className={errors.senderName ? "border-red-400" : ""}
                                />
                                {errors.senderName && (
                                    <p className="text-xs text-red-500">{errors.senderName.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="senderContact">
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        WhatsApp
                                    </span>
                                </Label>
                                <Input
                                    id="senderContact"
                                    name={senderContactField.name}
                                    ref={senderContactField.ref}
                                    onBlur={senderContactField.onBlur}
                                    value={senderContactValue}
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    maxLength={18}
                                    placeholder="(45) 99999 - 9999"
                                    onChange={(event) =>
                                        setValue("senderContact", formatBrazilWhatsapp(event.target.value), {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }
                                    className={errors.senderContact ? "border-red-400" : ""}
                                />
                                {errors.senderContact && (
                                    <p className="text-xs text-red-500">{errors.senderContact.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="senderEmail">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        Email para confirmação do pagamento{" "}
                                        <span className="text-xs font-normal text-slate-400">(opcional)</span>
                                    </span>
                                </Label>
                                <Input
                                    id="senderEmail"
                                    type="email"
                                    placeholder="seu@email.com"
                                    {...register("senderEmail")}
                                    className={errors.senderEmail ? "border-red-400" : ""}
                                />
                                {errors.senderEmail && (
                                    <p className="text-xs text-red-500">{errors.senderEmail.message}</p>
                                )}
                                <p className="text-xs text-slate-400">
                                    Se informado, você receberá um email quando o pagamento for confirmado.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-[#be123c]" />
                            <h3 className="font-bold text-slate-800">Quem vai receber</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="recipientName">Nome do destinatário</Label>
                                <Input
                                    id="recipientName"
                                    placeholder="Nome de quem vai receber"
                                    {...register("recipientName")}
                                    className={errors.recipientName ? "border-red-400" : ""}
                                />
                                {errors.recipientName && (
                                    <p className="text-xs text-red-500">{errors.recipientName.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipientCourse">Curso</Label>
                                <Input
                                    id="recipientCourse"
                                    placeholder="Ex: Direito, Informática, Medicina"
                                    {...register("recipientCourse")}
                                    className={errors.recipientCourse ? "border-red-400" : ""}
                                />
                                {errors.recipientCourse && (
                                    <p className="text-xs text-red-500">{errors.recipientCourse.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="recipientYear">Ano na faculdade</Label>
                                <Input
                                    id="recipientYear"
                                    placeholder="Ex: 1º ano, 3º ano, formando"
                                    {...register("recipientYear")}
                                    className={errors.recipientYear ? "border-red-400" : ""}
                                />
                                {errors.recipientYear && (
                                    <p className="text-xs text-red-500">{errors.recipientYear.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card message */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-[#be123c]" />
                            <h3 className="font-bold text-slate-800">Mensagem do cartão</h3>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cardMessage">
                                Escreva o que você quer no cartão{" "}
                                <span className="text-xs font-normal text-slate-400">(opcional, máx. 500 caracteres)</span>
                            </Label>
                            <textarea
                                id="cardMessage"
                                rows={4}
                                placeholder="Escreva sua mensagem aqui... 💌"
                                {...register("cardMessage")}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            {errors.cardMessage && (
                                <p className="text-xs text-red-500">{errors.cardMessage.message}</p>
                            )}
                        </div>
                    </div>

                    {serverError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {serverError}
                        </div>
                    )}

                    {!isEnabled ? (
                        <div className="rounded-2xl border-2 border-dashed border-[#be123c]/30 bg-rose-50 p-6 text-center">
                            <p className="font-semibold text-[#be123c]">Os pedidos ainda não estão abertos.</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Volte entre os dias <strong>8 e 12 de junho</strong> para fazer seu pedido!
                            </p>
                        </div>
                    ) : (
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-xl bg-[#be123c] text-base font-bold hover:bg-[#9f1239]"
                        >
                            {isSubmitting ? "Enviando pedido..." : "Fazer pedido 💌"}
                        </Button>
                    )}
                </form>

                <div className="mt-8 text-center">
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#be123c]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar para a home
                    </Link>
                </div>
            </div>
        </div>
    )
}
