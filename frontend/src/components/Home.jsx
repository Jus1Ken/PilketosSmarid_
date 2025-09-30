import { Users, Vote, CheckCircle, Clock } from "lucide-react";
import CandidateCard from "./CandidateCard";
import React from "react";
import { useVoting } from "../context/VotingContext";

const Home = ({ isAdmin, openModal }) => {
  const { candidates, totalVotes, handleVote, votedCandidate } = useVoting();
  
  // Calculate voting status
  const hasVoted = votedCandidate !== null;
  const votingProgress = candidates.length > 0 
    ? Math.round((totalVotes / (candidates.length * 100)) * 100) 
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center min-h-screen">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-4xl">
          <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
            Pemilihan OSIS 2025/2026
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
            Pemilihan Ketua & Wakil Ketua OSIS
          </h1>
          
          <p className="text-2xl text-gray-700 mb-2 font-medium">
            SMA Negeri 10 Samarinda
          </p>
          
          <p className="text-lg text-gray-500 mb-6">
            Periode 2025/2026
          </p>

          {/* Voting Status Alert */}
          {hasVoted ? (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-xl inline-flex items-center gap-3 mb-8 shadow-sm">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Terima kasih! Suara Anda telah tercatat untuk Paslon {votedCandidate}
              </span>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-6 py-4 rounded-xl inline-flex items-center gap-3 mb-8 shadow-sm">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                Setiap siswa hanya dapat memilih satu pasangan calon
              </span>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow min-w-[140px]">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {candidates.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Pasangan Calon</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow min-w-[140px]">
              <Vote className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {totalVotes}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Suara</div>
            </div>

            {isAdmin && (
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow min-w-[140px]">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {votingProgress}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Partisipasi</div>
              </div>
            )}
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="w-full max-w-7xl">
          {candidates.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Belum ada pasangan calon terdaftar</p>
              {isAdmin && (
                <button
                  onClick={() => openModal()}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Tambah Pasangan Calon
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-8 ${
              candidates.length === 1 
                ? 'grid-cols-1 max-w-md mx-auto' 
                : candidates.length === 2 
                ? 'md:grid-cols-2 max-w-3xl mx-auto' 
                : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {candidates.map((candidate) => (
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
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Gunakan hak pilih Anda dengan bijak.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;