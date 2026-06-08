'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { upsertDocument } from '@/lib/actions/documents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Upload, X, ExternalLink, ArrowLeft } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export function DocumentForm({ document }) {
    const isEditing = Boolean(document)
    const router = useRouter()

    const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm({
        defaultValues: {
            _id: document?._id ?? undefined,
            title: document?.title ?? '',
            type: document?.type ?? 'edital',
            description: document?.description ?? '',
            year: document?.year ?? CURRENT_YEAR,
            fileUrl: document?.fileUrl ?? '',
            fileName: document?.fileName ?? '',
        }
    })

    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    const fileUrl = watch('fileUrl')
    const fileName = watch('fileName')

    async function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadError('')
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload-doc', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error ?? 'Falha no upload')
            }

            const data = await res.json()
            setValue('fileUrl', data.url)
            setValue('fileName', data.fileName)
            toast.success('Arquivo enviado com sucesso.')
        } catch (err) {
            setUploadError(err?.message ?? 'Erro ao enviar o arquivo.')
            toast.error('Erro ao enviar o arquivo.')
        } finally {
            setUploading(false)
        }
    }

    function clearFile() {
        setValue('fileUrl', '')
        setValue('fileName', '')
    }

    async function onSubmit(values, status) {
        try {
            const data = { ...values, status }
            const result = await upsertDocument(data)
            if (!result.success) {
                toast.error(result.message)
                return
            }
            const messages = {
                published: 'Documento publicado!',
                draft: 'Rascunho salvo!',
            }
            toast.success(messages[status] ?? 'Salvo!')
            router.push('/dashboard/documentos')
            router.refresh()
        } catch (err) {
            toast.error('Erro ao salvar documento. ' + (err?.message ?? ''))
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard/documentos')}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <FileText className="size-5 text-[#2708ab]" />
                    <h1 className="text-xl font-semibold">
                        {isEditing ? 'Editar documento' : 'Novo documento'}
                    </h1>
                </div>
            </div>

            <form className="space-y-5">
                {/* Título */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                        placeholder="Ex: Edital de Eleições 2025"
                        {...register('title', { required: true })}
                    />
                </div>

                {/* Tipo e Ano */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Tipo *</label>
                        <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            {...register('type', { required: true })}
                        >
                            <option value="edital">Edital</option>
                            <option value="ata">Ata de Reunião</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Ano</label>
                        <Input
                            type="number"
                            min={2000}
                            max={2099}
                            {...register('year', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Descrição <span className="text-muted-foreground">(opcional)</span></label>
                    <textarea
                        rows={3}
                        placeholder="Breve descrição do documento..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        {...register('description')}
                    />
                </div>

                {/* Upload de arquivo */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Arquivo (PDF)</label>

                    {fileUrl ? (
                        <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <FileText className="size-5 shrink-0 text-emerald-600" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-emerald-800">{fileName || 'Arquivo carregado'}</p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                                >
                                    <ExternalLink className="size-3" />
                                    Visualizar
                                </a>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={clearFile} title="Remover arquivo">
                                <X className="size-4 text-emerald-700" />
                            </Button>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-[#2708ab]/40 hover:bg-[#f3f1ff]/30">
                            <Upload className="size-8 text-muted-foreground/50" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {uploading ? 'Enviando...' : 'Clique para selecionar um arquivo'}
                                </p>
                                <p className="text-xs text-muted-foreground/70">PDF, DOC, DOCX até 20MB</p>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="sr-only"
                                disabled={uploading}
                                onChange={handleFileChange}
                            />
                        </label>
                    )}

                    {uploadError && (
                        <p className="text-sm text-destructive">{uploadError}</p>
                    )}
                </div>

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-3 border-t pt-5">
                    <Button
                        type="button"
                        disabled={isSubmitting || uploading}
                        onClick={handleSubmit((values) => onSubmit(values, 'published'))}
                    >
                        {isSubmitting ? 'Salvando...' : 'Publicar'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting || uploading}
                        onClick={handleSubmit((values) => onSubmit(values, 'draft'))}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar rascunho'}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push('/dashboard/documentos')}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    )
}
