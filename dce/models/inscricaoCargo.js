import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const InscricaoCargoSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        course: { type: String, required: true, trim: true },
        semester: { type: String, required: true, trim: true },
        cargo: { type: String, required: true, trim: true },
        motivation: { type: String, required: true, trim: true },
        ipAddress: { type: String, trim: true },
        status: {
            type: String,
            enum: ["pendente", "em_analise", "aprovado", "rejeitado"],
            default: "pendente",
        },
    },
    { timestamps: true }
);

InscricaoCargoSchema.index({ ipAddress: 1, createdAt: -1 });
InscricaoCargoSchema.index({ email: 1, createdAt: -1 });

await dbConnect();

export const InscricaoCargo =
    mongoose.models.InscricaoCargo || mongoose.model("InscricaoCargo", InscricaoCargoSchema);
