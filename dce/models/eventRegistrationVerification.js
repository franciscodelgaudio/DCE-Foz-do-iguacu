import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const EventRegistrationVerificationSchema = new Schema(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
        academicEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@unioeste\.br$/i,
        },
        codeHash: { type: String, required: true },
        attempts: { type: Number, default: 0 },
        sentAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        verifiedAt: { type: Date },
        consumedAt: { type: Date },
    },
    { timestamps: true }
);

EventRegistrationVerificationSchema.index(
    { eventId: 1, academicEmail: 1 },
    { unique: true }
);
EventRegistrationVerificationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 3600 }
);

await dbConnect();

export const EventRegistrationVerification =
    mongoose.models.EventRegistrationVerification ||
    mongoose.model("EventRegistrationVerification", EventRegistrationVerificationSchema);
