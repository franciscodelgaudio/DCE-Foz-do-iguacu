import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const DocumentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["edital", "ata", "posse"],
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileName: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["draft", "published"],
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
    },
    {
        timestamps: true,
    }
);

await dbConnect();

export const Document =
    mongoose.models.Document || mongoose.model("Document", DocumentSchema);
