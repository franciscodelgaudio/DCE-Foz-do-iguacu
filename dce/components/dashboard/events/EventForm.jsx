'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import Tiptap from '@/components/ui/Tiptap'
import { upsertEvent } from '@/lib/actions/event'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const DEFAULT_HTML = '<p>Descreva o evento…</p>'

function toDatetimeLocalValue(date) {
    if (!date) return ''
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EventForm({ eventItem }) {
    const router = useRouter()
    const isEditing = !!eventItem

    const { register, control, handleSubmit, formState: { isSubmitting }, reset } = useForm({
        defaultValues: {
            title: '',
            location: '',
            eventDate: '',
            eventEndDate: '',
            excerpt: '',
            content: { html: DEFAULT_HTML, json: null },
        },
    })

    useEffect(() => {
        if (!eventItem) return
        reset({
            title: eventItem.title ?? '',
            location: eventItem.location ?? '',
            eventDate: toDatetimeLocalValue(eventItem.eventDate),
            eventEndDate: toDatetimeLocalValue(eventItem.eventEndDate),
            excerpt: eventItem.excerpt ?? '',
            content: {
                html: eventItem.contentHtml ?? DEFAULT_HTML,
                json: eventItem.contentJson ?? null,
            },
        })
    }, [eventItem, reset])

    async function onSubmit(values, status) {
        try {
            const data = {
                ...values,
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

                <Input
                    placeholder="Resumo curto do evento"
                    {...register('excerpt')}
                />

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

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit((values) => onSubmit(values, 'published'))}
                    >
                        {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar e publicar' : 'Publicar'}
                    </Button>

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
