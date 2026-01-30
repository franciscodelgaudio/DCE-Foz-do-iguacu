'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Row } from "./Row"
import { Heading } from "lucide-react"

export function Display({ news }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <div className="flex flex-row items-center space-x-2">
                            <Heading className="size-4" />
                            <span>Título</span>
                        </div>
                    </TableHead>
                    <TableHead>
                        Autor
                    </TableHead>
                    <TableHead>
                        Data de Criação
                    </TableHead>
                    <TableHead>
                        Ações
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {news.map((item) => (
                    <Row
                        key={item._id}
                        newsItem={item}
                    />
                ))}
            </TableBody>
        </Table>
    )
}