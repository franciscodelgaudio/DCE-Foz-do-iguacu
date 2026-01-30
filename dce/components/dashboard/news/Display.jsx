'use client'

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Row } from "./Row"
import { Calendar, Heading, Plus, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function Display({ news }) {
    const router = useRouter();

    return (
        <div>
            <div className="p-4 flex justify-end mb-4">
                <Button
                    onClick={() => { router.push('/dashboard/news/createNews') }}
                >
                    <Plus className="size-4" />
                    Nova notícia
                </Button>
            </div>
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
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}