'use client'

import { useEffect } from "react"
import { incrementViewCount } from "@/lib/actions/news"

export function ViewTracker({ newsId }) {
    useEffect(() => {
        incrementViewCount(newsId)
    }, [newsId])

    return null
}
