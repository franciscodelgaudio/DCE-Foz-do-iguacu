import mongoose, { Schema } from "mongoose";
import { dbConnect } from "@/lib/mongoose.js";

const AnswerSchema = new Schema(
    {
        key: { type: String },
        label: { type: String },
        value: { type: Schema.Types.Mixed },
    },
    { _id: false }
);

const EventRegistrationSchema = new Schema(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
        registrationNumber: { type: String },
        academicEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@unioeste\.br$/i,
        },
        answers: [AnswerSchema],
        ipAddress: { type: String, trim: true },
        paymentStatus: {
            type: String,
            enum: ["not_required", "pending", "confirmed", "cancelled"],
            default: "not_required",
        },
        confirmedAt: { type: Date },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

EventRegistrationSchema.index({ ipAddress: 1, createdAt: -1 });
EventRegistrationSchema.index(
    { eventId: 1, academicEmail: 1 },
    {
        unique: true,
        partialFilterExpression: { academicEmail: { $exists: true, $type: "string" } },
    }
);

await dbConnect();

export const EventRegistration =
    mongoose.models.EventRegistration ||
    mongoose.model("EventRegistration", EventRegistrationSchema);
