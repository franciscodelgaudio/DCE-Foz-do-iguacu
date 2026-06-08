'use client'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'

import Tiptap from '../../../ui/Tiptap'
import { upsertNews } from '@/lib/actions/news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function Display({ isAdmin = false }) {
    const { register, control, handleSubmit, watch, formState: { isSubmitting }, } = useForm({})
    const router = useRouter();
    const scheduledAt = watch('scheduledAt')

    async function onSubmit(values, status) {
        try {
            const data = {
                ...values,
                excerpt: values.excerpt?.html ?? '',
                status,
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="-mx-4 px-4 py-3 bg-background border-b flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {isAdmin ? (
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmit((values) => onSubmit(values, 'published'))}
                            >
                                {isSubmitting ? 'Salvando…' : 'Publicar'}
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">
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
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Agendar publicação:</span>
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
                    )}
                </div>

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
                                initialHtml={field.value?.html ?? '<p>Escreva sua notícia…</p>'}
                                onChange={({ html, json }) => field.onChange({ html, json })}
                            />

                            {fieldState.error?.message ? (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                        </div>
                    )}
                />
            </form>
        </div>
    )
}
