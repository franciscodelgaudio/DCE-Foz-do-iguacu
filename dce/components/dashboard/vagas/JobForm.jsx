'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { upsertJob } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, ArrowLeft } from 'lucide-react'

export function JobForm({ jobItem }) {
    const router = useRouter()
    const isEditing = !!jobItem

    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
        defaultValues: {
            title: '',
            area: '',
            description: '',
            requirements: '',
            workload: '',
            status: 'open',
        },
    })

    useEffect(() => {
        if (!jobItem) return
        reset({
            title: jobItem.title ?? '',
            area: jobItem.area ?? '',
            description: jobItem.description ?? '',
            requirements: jobItem.requirements ?? '',
            workload: jobItem.workload ?? '',
            status: jobItem.status ?? 'open',
        })
    }, [jobItem, reset])

    async function onSubmit(values) {
        try {
            const data = {
                ...values,
                ...(isEditing ? { _id: jobItem._id } : {}),
            }
            const result = await upsertJob(data)
            if (!result.success) { toast.error(result.message); return }
            toast.success(result.message)
            router.push('/dashboard/vagas')
            router.refresh()
        } catch (err) {
            toast.error('Erro ao salvar vaga. ' + (err?.message ?? ''))
        }
    }

    return (
        <div>
            <div className="border-b bg-white px-6 py-5">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/vagas"
                        className="flex size-8 items-center justify-center rounded-md border hover:bg-gray-50"
                    >
                        <ArrowLeft className="size-4" />
                    </Link>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2708ab]/10">
                        <Briefcase className="size-5 text-[#2708ab]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing ? 'Atualize os dados da vaga' : 'Preencha os dados para publicar a vaga'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6 px-6 py-8">

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Título da Vaga *</label>
                    <Input
                        placeholder="Ex: Diretor de Comunicação"
                        {...register('title', { required: true })}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-xs text-red-500">Título é obrigatório.</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Área / Coordenação</label>
                    <Input
                        placeholder="Ex: Comunicação, Cultura, Ensino…"
                        {...register('area')}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Carga Horária</label>
                    <Input
                        placeholder="Ex: 10h semanais"
                        {...register('workload')}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        rows={5}
                        placeholder="Descreva as atividades e responsabilidades da vaga…"
                        {...register('description')}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Requisitos</label>
                    <textarea
                        rows={4}
                        placeholder="Liste os requisitos necessários…"
                        {...register('requirements')}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                        {...register('status')}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="open">Aberta</option>
                        <option value="closed">Encerrada</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3 border-t pt-6">
                    <Button type="button" variant="outline" onClick={() => router.push('/dashboard/vagas')}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar vaga'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
