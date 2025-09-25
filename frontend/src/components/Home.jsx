import { Users, Vote } from "lucide-react";
import CandidateCard from "./CandidateCard";
import React from "react";
import { useVoting } from "../context/VotingContext";

const Home = ({ isAdmin, openModal }) => {
  const { candidates, totalVotes, handleVote, votedCandidate } = useVoting();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Pemilihan Ketua & Wakil Ketua OSIS
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            SMA Negeri 10 Samarinda
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Periode 2025/2026
          </p>
          <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block mb-8">
            Setiap siswa hanya dapat memilih satu pasangan calon (Ketua & Wakil Ketua)
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {candidates.length}
              </div>
              <div className="text-sm text-gray-600">Paslon</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <Vote className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{totalVotes}</div>
              <div className="text-sm text-gray-600">Total Suara</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(candidates) && candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              handleVote={handleVote}
              votedCandidate={votedCandidate}
              isAdmin={isAdmin}
              openModal={openModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
