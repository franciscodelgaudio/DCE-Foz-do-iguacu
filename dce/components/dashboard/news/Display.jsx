'use client'

import { useMemo, useState } from "react"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Row } from "./Row"
import { Calendar, CircleDot, Heading, Plus, Settings, Trash2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toast } from "sonner"
import { deleteManyNews } from "@/lib/actions/news"

export function Display({ news }) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState([])

    const newsIds = useMemo(() => news.map((item) => String(item._id)), [news])
    const selectedCount = selectedIds.length
    const hasSelection = selectedCount > 0
    const allSelected = newsIds.length > 0 && selectedCount === newsIds.length

    function toggleSelected(newsId) {
        setSelectedIds((current) => {
            const id = String(newsId)
            return current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        })
    }

    function toggleAllSelected() {
        setSelectedIds(allSelected ? [] : newsIds)
    }

    async function handleDeleteSelected() {
        try {
            const result = await deleteManyNews(selectedIds)

            if (!result.success) {
                toast.error(result.message)
                return
            }

            setSelectedIds([])
            router.refresh()
            toast.success(result.message)
        } catch (err) {
            toast.error("Erro ao deletar as notícias. " + (err?.message ?? ""))
        }
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="text-sm text-muted-foreground">
                    {hasSelection ? `${selectedCount} selecionada(s)` : "Selecione artigos para ações em lote"}
                </div>

                <div className="flex items-center gap-2">
                    <ConfirmDialog
                        title="Excluir artigos selecionados"
                        subtitle={`Tem certeza que deseja deletar ${selectedCount} artigo(s)? Esta ação não pode ser desfeita.`}
                        onClick={handleDeleteSelected}
                    >
                        <Button variant="destructive" disabled={!hasSelection}>
                            <Trash2 className="size-4" />
                            Excluir selecionadas
                        </Button>
                    </ConfirmDialog>

                    <Button onClick={() => { router.push('/dashboard/news/createNews') }}>
                        <Plus className="size-4" />
                        Nova notícia
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <input
                                type="checkbox"
                                aria-label="Selecionar todas as notícias"
                                checked={allSelected}
                                onChange={toggleAllSelected}
                                className="size-4 accent-[#2708ab]"
                            />
                        </TableHead>
                        <TableHead>
                            <div className="flex flex-row items-center space-x-2">
                                <Heading className="size-4" />
                                <span>Título</span>
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex flex-row items-center space-x-2">
                                <User className="size-4" />
                                <span>Autor</span>
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex flex-row items-center space-x-2">
                                <Calendar className="size-4" />
                                <span>Data de Criação</span>
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex flex-row items-center space-x-2">
                                <CircleDot className="size-4" />
                                <span>Status</span>
                            </div>
                        </TableHead>
                        <TableHead>
                            <div className="flex flex-row items-center space-x-2">
                                <Settings className="size-4" />
                                <span>Ações</span>
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {news.map((item) => (
                        <Row
                            key={item._id}
                            newsItem={item}
                            selected={selectedIds.includes(String(item._id))}
                            onSelectChange={toggleSelected}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
