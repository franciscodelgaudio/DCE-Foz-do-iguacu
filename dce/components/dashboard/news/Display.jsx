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

export function Display({ news }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        Título
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