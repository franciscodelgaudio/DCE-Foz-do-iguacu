import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const NewsSchema = new Schema(
    {
        title: {
            type: String,
        },

        excerpt: {
            type: String,
        },

        // Conteúdo do Tiptap
        contentHtml: {
            type: String,
        },
        // editor.getHTML()
        contentJson: {
            type: Schema.Types.Mixed,
        },     // editor.getJSON()

        // Opcional: texto “limpo” pra busca (você pode gerar a partir do HTML)
        contentText: {
            type: String,
            index: "text"
        },

        // Mídia
        cover: {
            url: { type: String, trim: true },
            alt: { type: String, trim: true },
            credit: { type: String, trim: true },
        },

        // Organização
        tags: [{
            type: String,
            trim: true,
        }],
        category: {
            type: String,
            trim: true,
        },
        // Publicação
        status: {
            type: String,
            enum: ["draft", "published", "scheduled", "archived"],
            default: "draft",
        },
        publishedAt: {
            type: Date,
        },
        scheduledAt: {
            type: Date,
        },
        author: {
            id: {
                type: String,
            },
            name: {
                type: String,
                trim: true
            },
            avatarUrl: {
                type: String,
                trim: true
            },
        },
    },
    {
        timestamps: true, // createdAt/updatedAt
    }
);

await dbConnect();

export const News = mongoose.models.News || mongoose.model("News", NewsSchema);
