'use client'

import {
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";
import { formatDate } from "../../ui/formatDate";
import { toast } from "sonner";
import { deleteNews } from "../../../lib/actions/news";

const STATUS_OPTIONS = [
    { value: "draft", label: "Rascunho" },
    { value: "published", label: "Publicado" },
    { value: "scheduled", label: "Agendado" },
    { value: "archived", label: "Arquivado" },
];

const STATUS_STYLES = {
    published: "bg-emerald-100 text-emerald-700 border-emerald-200",
    scheduled: "bg-amber-100 text-amber-700 border-amber-200",
    archived: "bg-slate-100 text-slate-700 border-slate-200",
    draft: "bg-muted text-muted-foreground border-muted",
};

function StatusBadge({ value }) {
    const option = STATUS_OPTIONS.find(o => o.value === value);
    const label = option?.label ?? "—";
    const cls = STATUS_STYLES[value] ?? "bg-muted text-muted-foreground border-muted";
    return <Badge variant="outline" className={cls}>{label}</Badge>;
}

export function Row({ newsItem }) {

    const router = useRouter();

    async function handleClick() {
        router.push(`/dashboard/news/${newsItem._id}`);
    }

    async function handleDelete() {
        try {
            await deleteNews(newsItem._id);
            router.refresh();
            toast.success("Notícia deletada com sucesso.");
        } catch (err) {
            toast.error("Erro ao deletar a notícia. " + (err?.message ?? ""));
        }
    }

    return (
        <TableRow>
            <TableCell>{newsItem.title}</TableCell>
            <TableCell>{newsItem.author?.name ?? "-"}</TableCell>
            <TableCell>{formatDate(newsItem.publishedAt) ?? "-"}</TableCell>
            <TableCell><StatusBadge value={newsItem.status} /></TableCell>
            <TableCell
                onClick={(e) => e.stopPropagation()}
                className="cursor-default"
            >
                <div className="flex flex-row items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleClick}>
                        <PenSquare className="size-4" />
                    </Button>
                    <ConfirmDialog
                        title={"Excluir notícia"}
                        subtitle={"Tem certeza que deseja deletar esta notícia?"}
                        onClick={handleDelete}
                    >
                        <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </ConfirmDialog>
                </div>
            </TableCell>
        </TableRow>
    )
}