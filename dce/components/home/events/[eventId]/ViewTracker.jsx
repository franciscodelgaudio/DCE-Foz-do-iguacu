'use client'

import { useEffect } from "react"
import { incrementEventViewCount } from "@/lib/actions/event"

export function ViewTracker({ eventId }) {
    useEffect(() => {
        incrementEventViewCount(eventId)
    }, [eventId])

    return null
}
