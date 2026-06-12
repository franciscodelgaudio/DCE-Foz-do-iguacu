import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const ContactSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        subject: { type: String, trim: true },
        message: { type: String, required: true, trim: true },
        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread",
        },
    },
    { timestamps: true }
);

ContactSchema.index({ email: 1, createdAt: -1 });

await dbConnect();

export const Contact =
    mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
