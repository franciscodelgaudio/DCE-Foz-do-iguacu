'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import Tiptap from '@/components/ui/Tiptap'
import { upsertEvent } from '@/lib/actions/event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { RegistrationSection } from './RegistrationSection'

const DEFAULT_HTML = '<p>Descreva o evento…</p>'

function toDatetimeLocalValue(date) {
    if (!date) return ''
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toDatetimeLocalFromISO(date) {
    if (!date) return ''
    return toDatetimeLocalValue(new Date(date))
}

export function EventForm({ eventItem, registrationCount = 0, isAdmin = false }) {
    const router = useRouter()
    const isEditing = !!eventItem

    const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting, errors }, reset } = useForm({
        defaultValues: {
            title: '',
            location: '',
            eventDate: '',
            eventEndDate: '',
            excerpt: { html: '', json: null },
            content: { html: DEFAULT_HTML, json: null },
            registration: {
                enabled: false,
                deadline: '',
                limit: '',
                requiresPayment: false,
                paymentAmount: '',
                pixKey: '',
                pixKeyType: 'email',
                pixRecipientName: '',
                formFields: [],
            },
        },
    })

    useEffect(() => {
        if (!eventItem) return
        const reg = eventItem.registration
        reset({
            title: eventItem.title ?? '',
            location: eventItem.location ?? '',
            eventDate: toDatetimeLocalValue(eventItem.eventDate),
            eventEndDate: toDatetimeLocalValue(eventItem.eventEndDate),
            excerpt: { html: eventItem.excerpt ?? '', json: null },
            content: {
                html: eventItem.contentHtml ?? DEFAULT_HTML,
                json: eventItem.contentJson ?? null,
            },
            registration: {
                enabled: reg?.enabled ?? false,
                deadline: toDatetimeLocalFromISO(reg?.deadline),
                limit: reg?.limit ?? '',
                requiresPayment: reg?.requiresPayment ?? false,
                paymentAmount: reg?.paymentAmount ?? '',
                pixKey: reg?.pixKey ?? '',
                pixKeyType: reg?.pixKeyType ?? 'email',
                pixRecipientName: reg?.pixRecipientName ?? '',
                formFields: (reg?.formFields ?? []).map((f) => ({
                    key: f.key,
                    label: f.label,
                    type: f.type,
                    required: f.required ?? false,
                    optionsText: (f.options ?? []).join(', '),
                })),
            },
        })
    }, [eventItem, reset])

    async function onSubmit(values, status) {
        try {
            const data = {
                ...values,
                excerpt: values.excerpt?.html ?? '',
                status,
                ...(isEditing ? { _id: eventItem._id } : {}),
            }

            const result = await upsertEvent(data)

            if (!result.success) {
                toast.error(result.message)
                return
            }

            const messages = {
                published: 'Evento publicado!',
                draft: 'Rascunho salvo!',
                archived: 'Evento arquivado!',
            }
            toast.success(messages[status] ?? 'Salvo!')
            router.refresh()
            router.push('/dashboard/events')
        } catch (err) {
            toast.error('Erro ao salvar evento. ' + (err?.message ?? ''))
        }
    }

    return (
        <div className="p-4 max-w-3xl">
            {isEditing && (
                <div className="mb-4 flex items-center gap-2">
                    <Link
                        href={`/dashboard/events/${eventItem._id}/registrations`}
                        className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <ClipboardList className="size-4" />
                        Ver inscrições
                        {registrationCount > 0 && (
                            <span className="ml-1 rounded-full bg-[#2708ab]/10 px-1.5 py-0.5 text-xs font-semibold text-[#2708ab]">
                                {registrationCount}
                            </span>
                        )}
                    </Link>
                </div>
            )}

            <form className="space-y-5">
                <Input
                    placeholder="Título do evento"
                    {...register('title', { required: true })}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Início do evento</p>
                        <Input type="datetime-local" {...register('eventDate')} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Fim do evento (opcional)</p>
                        <Input type="datetime-local" {...register('eventEndDate')} />
                    </div>
                </div>

                <Input
                    placeholder="Local (ex: Bloco X, Sala 101)"
                    {...register('location')}
                />

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Resumo</p>
                    <Controller
                        control={control}
                        name="excerpt"
                        render={({ field }) => (
                            <Tiptap
                                minimal
                                initialHtml={field.value?.html ?? ''}
                                onChange={({ html, json }) => field.onChange({ html, json })}
                            />
                        )}
                    />
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Descrição completa</p>
                    <Controller
                        control={control}
                        name="content"
                        rules={{ validate: (v) => (v?.html?.trim() ? true : 'Descrição obrigatória') }}
                        render={({ field, fieldState }) => (
                            <div className="space-y-2">
                                <Tiptap
                                    initialHtml={field.value?.html ?? DEFAULT_HTML}
                                    onChange={({ html, json }) => field.onChange({ html, json })}
                                />
                                {fieldState.error?.message ? (
                                    <p className="text-sm text-destructive">{fieldState.error.message}</p>
                                ) : null}
                            </div>
                        )}
                    />
                </div>

                <RegistrationSection
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                />

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {isAdmin ? (
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleSubmit((values) => onSubmit(values, 'published'))}
                        >
                            {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar e publicar' : 'Publicar'}
                        </Button>
                    ) : (
                        <p className="text-sm text-muted-foreground self-center">
                            Apenas administradores podem publicar.
                        </p>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={handleSubmit((values) => onSubmit(values, 'draft'))}
                    >
                        {isSubmitting ? 'Salvando…' : 'Salvar rascunho'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
