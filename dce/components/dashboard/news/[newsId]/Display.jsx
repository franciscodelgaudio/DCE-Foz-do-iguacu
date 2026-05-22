'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import Tiptap from '../../../ui/Tiptap'
import { upsertNews } from '@/lib/actions/news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const DEFAULT_HTML = '<p>Escreva sua notícia…</p>'

function toDatetimeLocalValue(date) {
    if (!date) return ''
    const d = new Date(date)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function Display({ newItem }) {
    const router = useRouter()

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            title: '',
            excerpt: { html: '', json: null },
            content: { html: DEFAULT_HTML, json: null },
            scheduledAt: '',
        },
    })

    const scheduledAt = watch('scheduledAt')

    useEffect(() => {
        if (!newItem) return

        reset({
            title: newItem.title ?? '',
            excerpt: { html: newItem.excerpt ?? '', json: null },
            content: {
                html: newItem.contentHtml ?? newItem.contentHTML ?? DEFAULT_HTML,
                json: newItem.contentJson ?? newItem.contentJSON ?? null,
            },
            scheduledAt: toDatetimeLocalValue(newItem.scheduledAt),
        })
    }, [newItem, reset])

    async function onSubmit(values, status) {
        try {
            const data = {
                ...values,
                excerpt: values.excerpt?.html ?? '',
                status,
                ...(newItem?._id ? { _id: newItem._id } : {}),
            }

            if (status === 'scheduled') {
                if (!values.scheduledAt) {
                    toast.error('Selecione uma data e horário para agendar.')
                    return
                }
                data.scheduledAt = new Date(values.scheduledAt).toISOString()
            }

            await upsertNews(data)

            const messages = {
                published: 'Notícia publicada!',
                draft: 'Rascunho salvo!',
                scheduled: 'Publicação agendada!',
            }
            toast.success(messages[status] ?? 'Salvo!')
            router.refresh()
            router.push('/dashboard/news')
        } catch (err) {
            toast.error('Erro ao salvar notícia. ' + (err?.message ?? ''))
        }
    }

    return (
        <div className="p-4">
            <form className="space-y-4">
                <Input
                    placeholder="Título"
                    className="border p-2 w-full rounded-md"
                    {...register('title', { required: true })}
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

                <Controller
                    control={control}
                    name="content"
                    rules={{
                        validate: (v) => (v?.html?.trim() ? true : 'Conteúdo obrigatório'),
                    }}
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

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit((values) => onSubmit(values, 'published'))}
                    >
                        {isSubmitting ? 'Salvando…' : 'Editar e publicar'}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={handleSubmit((values) => onSubmit(values, 'draft'))}
                    >
                        {isSubmitting ? 'Salvando…' : 'Editar e salvar rascunho'}
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Agendar publicação:</span>
                    <Input
                        type="datetime-local"
                        className="w-auto"
                        {...register('scheduledAt')}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting || !scheduledAt}
                        onClick={handleSubmit((values) => onSubmit(values, 'scheduled'))}
                    >
                        {isSubmitting ? 'Salvando…' : 'Agendar'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
