import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const FormFieldSchema = new Schema(
    {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: {
            type: String,
            enum: ["text", "email", "tel", "number", "select", "textarea", "checkbox"],
            default: "text",
        },
        required: { type: Boolean, default: false },
        options: [{ type: String }],
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const RegistrationConfigSchema = new Schema(
    {
        enabled: { type: Boolean, default: false },
        deadline: { type: Date },
        limit: { type: Number },
        requiresPayment: { type: Boolean, default: false },
        paymentAmount: { type: Number },
        pixKey: { type: String },
        pixKeyType: { type: String, enum: ["email", "phone", "cpf", "random"] },
        pixRecipientName: { type: String },
        formFields: [FormFieldSchema],
    },
    { _id: false }
);

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

        registration: RegistrationConfigSchema,
    },
    {
        timestamps: true,
    }
);

await dbConnect();

export const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
