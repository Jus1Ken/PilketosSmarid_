import mongoose from "mongoose";

const pemilihSchema = new mongoose.Schema({
  uniqueCode: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
  studentName: { type: String, required: true },
  votedAt: { type: Date },
});

export const Pemilih = mongoose.model("Pemilih", pemilihSchema);
