'use client'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'

import Tiptap from '../../../ui/Tiptap'
import { upsertNews } from '@/lib/actions/news'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Display({ newItem }) {
    const {
        register,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            title: newItem?.title ?? '',
            excerpt: newItem?.excerpt ?? '',
            content: {
                html: newItem?.contentHtml ?? '<p>Escreva sua notícia…</p>',
                json: newItem?.contentJson ?? null,
            },
        },
    })

    async function onSubmit(values) {
        try {
            await upsertNews({
                ...values,
                contentHtml: values.content.html,
                contentJson: values.content.json,
            })

            toast.success('Notícia salva com sucesso!')
        } catch (err) {
            toast.error('Erro ao salvar notícia. ' + (err?.message ?? ''))
        }
    }

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    placeholder="Título"
                    className="border p-2 w-full rounded-md"
                    {...register('title', { required: true })}
                />

                <Input
                    placeholder="Resumo"
                    className="border p-2 w-full rounded-md"
                    {...register('excerpt')}
                />

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

                <Button type="submit" className="border px-4 py-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando…' : 'Publicar'}
                </Button>
            </form>
        </div>
    )
}
