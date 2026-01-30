'use client'

import {
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation";

export function Row({ newsItem }) {

    const router = useRouter();

    async function handleClick() {
        router.push(`/dashboard/news/${newsItem._id}`);
    }

    return (
        <TableRow
            className="cursor-pointer"
            onClick={handleClick}
        >
            <TableCell>{newsItem.title}</TableCell>
            <TableCell>{newsItem.author}</TableCell>
            <TableCell>{newsItem.creationDate}</TableCell>
            <TableCell>Actions</TableCell>
        </TableRow>
    )
}