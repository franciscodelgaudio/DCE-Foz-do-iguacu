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

export function Row({ newsItem }) {
    return (
        <TableRow>
            <TableCell>{newsItem.title}</TableCell>
            <TableCell>{newsItem.author}</TableCell>
            <TableCell>{newsItem.creationDate}</TableCell>
            <TableCell>Actions</TableCell>
        </TableRow>
    )
}