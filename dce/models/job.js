import mongoose, { Schema } from "mongoose";
import { dbConnect } from "../lib/mongoose.js";

const JobSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        area: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
        },
        requirements: {
            type: String,
        },
        workload: {
            type: String,
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        publishedAt: {
            type: Date,
        },
        author: {
            name: { type: String },
            email: { type: String, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

await dbConnect();

export const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);
