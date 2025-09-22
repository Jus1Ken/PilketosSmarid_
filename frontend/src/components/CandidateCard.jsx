import React from "react";

const CandidateCard = ({ candidate, handleVote, votedCandidate, isAdmin, openModal }) => {
  const handleVoteClick = () => {
    openModal(candidate);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
      <div className="relative">
        {/* Joint Image of Ketua and Wakil Ketua */} 
        <div className="relative h-64 bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
          <img
            src={candidate.jointPhoto}
            alt={`${candidate.ketua.name} & ${candidate.wakilKetua.name}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {candidate.votes} suara
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Nama Ketua dan Wakil */}
        <div className="mb-6 text-center">
          <div className="flex justify-center space-x-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{candidate.ketua.name}</h3>
              <p className="text-sm text-gray-600">Ketua</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{candidate.wakilKetua.name}</h3>
              <p className="text-sm text-gray-600">Wakil Ketua</p>
            </div>
          </div>
        </div>
        {/* Visi Bersama */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-blue-600 mb-3">Visi Bersama:</h4>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-700 text-sm leading-relaxed">{candidate.visi}</p>
          </div>
        </div>

        {/* Misi Bersama */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-blue-600 mb-3">Misi Bersama:</h4>
          <div className="p-4 bg-green-50 rounded-lg">
            <ul className="text-gray-700 text-sm space-y-2">
              {candidate.misi.map((misi, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">{index + 1}.</span>
                  <span>{misi}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* NIS Information */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">NIS Ketua:</span> {candidate.ketua.nis} |
            <span className="font-medium ml-2">NIS Wakil Ketua:</span> {candidate.wakilKetua.nis}
          </p>
        </div>

        <button
          onClick={handleVoteClick}
          disabled={votedCandidate !== null}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            votedCandidate === candidate.id
              ? "bg-green-500 text-white"
              : votedCandidate !== null
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
          }`}
        >
          {votedCandidate === candidate.id ? "✓ Sudah Memilih Paslon Ini" :
           votedCandidate !== null ? "Anda Sudah Memilih" : "Pilih Paslon Ini"}
        </button>
      </div>
    </div>
  );
};

export default CandidateCard;
