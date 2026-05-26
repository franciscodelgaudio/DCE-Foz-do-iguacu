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
        answers: [AnswerSchema],
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

await dbConnect();

export const EventRegistration =
    mongoose.models.EventRegistration ||
    mongoose.model("EventRegistration", EventRegistrationSchema);
