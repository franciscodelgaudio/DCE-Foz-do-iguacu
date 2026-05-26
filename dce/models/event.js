import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const EventSchema = new Schema(
    {
        title: {
            type: String,
        },

        excerpt: {
            type: String,
        },

        contentHtml: {
            type: String,
        },
        contentJson: {
            type: Schema.Types.Mixed,
        },

        location: {
            type: String,
            trim: true,
        },

        eventDate: {
            type: Date,
        },

        eventEndDate: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },

        publishedAt: {
            type: Date,
        },

        author: {
            name: { type: String },
            email: { type: String, trim: true },
            avatarUrl: { type: String, trim: true },
        },

        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

await dbConnect();

export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
