import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const NewsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 180
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },

        // Resumo / chamada
        excerpt: {
            type: String,
            maxlength: 400
        },

        // Conteúdo do Tiptap
        contentHtml: {
            type: String,
            required: true
        },
        // editor.getHTML()
        contentJson: {
            type: Schema.Types.Mixed,
            required: true
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
            index: true
        },

        // Publicação
        status: {
            type: String,
            enum: ["draft", "published", "scheduled", "archived"],
            default: "draft",
            index: true,
        },
        publishedAt: {
            type: Date,
            index: true
        },
        scheduledAt: {
            type: Date,
            index: true
        },

        // Autor (ajuste conforme seu auth)
        author: {
            id: {
                type: String,
                index: true
            },     // ou Schema.Types.ObjectId se tiver coleção Users
            name: {
                type: String,
                trim: true
            },
            avatarUrl: {
                type: String,
                trim: true
            },
        },

        // SEO básico
        seo: {
            metaTitle: {
                type: String,
                trim: true,
                maxlength: 70
            },
            metaDescription: {
                type: String,
                trim: true,
                maxlength: 160
            },
            ogImage: {
                type: String,
                trim: true
            },
        },

        // Flags úteis
        pinned: {
            type: Boolean,
            default: false,
            index: true
        },
        viewCount: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true, // createdAt/updatedAt
    }
);

await dbConnect();

export const News = mongoose.models.News || mongoose.model("News", NewsSchema);
