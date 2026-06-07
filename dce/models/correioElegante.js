import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const CorreioEleganteSchema = new Schema(
    {
        orderNumber: { type: String },
        senderName: { type: String, required: true, trim: true },
        senderContact: { type: String, trim: true },
        senderEmail: { type: String, trim: true },
        recipientName: { type: String, required: true, trim: true },
        recipientCourse: { type: String, trim: true },
        recipientYear: { type: String, trim: true },
        package: {
            type: String,
            enum: ["cartinha", "bombom_cartinha", "rosa", "bombom_cartinha_rosa"],
            required: true,
        },
        price: { type: Number, required: true },
        cardMessage: { type: String, trim: true },
        isAnonymous: { type: Boolean, default: false },
        paymentStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        confirmedAt: { type: Date },
        deliveryStatus: {
            type: String,
            enum: ["not_ready", "ready", "delivered"],
            default: "not_ready",
        },
        readyAt: { type: Date },
        deliveredAt: { type: Date },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

await dbConnect();

export const CorreioElegante =
    mongoose.models.CorreioElegante ||
    mongoose.model("CorreioElegante", CorreioEleganteSchema);
