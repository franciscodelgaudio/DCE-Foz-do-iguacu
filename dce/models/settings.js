import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const SettingsSchema = new Schema(
    {
        pixKey: { type: String, default: "" },
        pixKeyType: {
            type: String,
            enum: ["email", "phone", "cpf", "random"],
            default: "email",
        },
        pixRecipientName: { type: String, default: "" },
        correioEleganteEnabled: { type: Boolean, default: true },
        correioEleganteStock: {
            cartinha: { type: Number, default: 0, min: 0 },
            rosa: { type: Number, default: 0, min: 0 },
            bombom: { type: Number, default: 0, min: 0 },
        },
    },
    { timestamps: true }
);

await dbConnect();

export const Settings =
    mongoose.models.Settings ||
    mongoose.model("Settings", SettingsSchema);
