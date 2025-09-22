import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  // Ketua OSIS
  ketua: {
    name: { type: String, required: true },
    nis: { type: String, required: true },
    
  },
  // Wakil Ketua OSIS
  wakilKetua: {
    name: { type: String, required: true },
    nis: { type: String, required: true },

  },
  // Common fields
  votes: { type: Number, default: 0 },
  // Joint photo of both candidates
  jointPhoto: { type: String, required: true },
  // Combined visi and misi for display purposes
  visi: { type: String },
  misi: [{ type: String }],
});

export const Candidate = mongoose.model("Candidate", candidateSchema);
