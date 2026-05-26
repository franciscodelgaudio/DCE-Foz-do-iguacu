import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String },
        avatarUrl: { type: String },
        role: { type: String, enum: ["admin", "membro"], default: "membro" },
        permissions: {
            news: { type: Boolean, default: true },
            events: { type: Boolean, default: true },
            correioElegante: { type: Boolean, default: true },
            settings: { type: Boolean, default: false },
        },
        status: { type: String, enum: ["convidado", "ativo", "suspenso"], default: "convidado" },
        invitedBy: { type: String },
        invitedAt: { type: Date },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)
