import { Trophy } from "lucide-react";
import React from "react";
import { useVoting } from "../context/VotingContext";

const Results = () => {
  const { candidates, totalVotes } = useVoting();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Hasil Pemilihan</h2>
          <p className="text-xl text-gray-600">Total Suara: {totalVotes}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {candidates
            .sort((a, b) => b.votes - a.votes)
            .map((candidate, index) => {
              const percentage =
                totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;

              return (
                <div key={candidate.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <img
                        src={candidate.jointPhoto}
                        alt={`${candidate.ketua.name} & ${candidate.wakilKetua.name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{candidate.ketua.name} & {candidate.wakilKetua.name}</h3>
                        <p className="text-gray-600">
                          {candidate.votes} suara ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400 to-gray-600"
                          : "bg-gradient-to-r from-orange-400 to-orange-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Results;
