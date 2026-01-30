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

export function Display({ newItem }) {
    const router = useRouter()

    const {
        register,
        control,
        handleSubmit,
        formState: { isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            title: '',
            excerpt: '',
            content: { html: DEFAULT_HTML, json: null },
        },
    })

    useEffect(() => {
        if (!newItem) return

        reset({
            title: newItem.title ?? '',
            excerpt: newItem.excerpt ?? '',
            content: {
                html: newItem.contentHtml ?? newItem.contentHTML ?? DEFAULT_HTML,
                json: newItem.contentJson ?? newItem.contentJSON ?? null,
            },
        })
    }, [newItem, reset])

    async function onSubmit(values, status) {
        try {
            await upsertNews({
                ...values,
                status,
                ...(newItem?._id ? { _id: newItem._id } : {}),
            })

            toast.success(status === 'published' ? 'Notícia publicada!' : 'Rascunho salvo!')
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
                                initialHtml={field.value?.html ?? DEFAULT_HTML}
                                onChange={({ html, json }) => field.onChange({ html, json })}
                            />

                            {fieldState.error?.message ? (
                                <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            ) : null}
                        </div>
                    )}
                />

                <div className="flex gap-2">
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
            </form>
        </div>
    )
}
