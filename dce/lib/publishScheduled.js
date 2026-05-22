import { News } from "@/models/news"

export async function publishScheduled() {
    const now = new Date()
    const result = await News.updateMany(
        { status: "scheduled", scheduledAt: { $lte: now } },
        { $set: { status: "published", publishedAt: now } }
    )
    return result.modifiedCount
}
