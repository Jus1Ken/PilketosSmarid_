import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, onConfirm, candidateName, uniqueCode, setUniqueCode, validateCode, codeError }) => {
  const [inputCode, setInputCode] = useState(uniqueCode);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputCode(uniqueCode);
    }
  }, [isOpen, uniqueCode]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!inputCode.trim()) {
      alert("Silakan masukkan kode unik Anda");
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateCode(inputCode);
      if (isValid) {
        setUniqueCode(inputCode);
        onConfirm(inputCode.trim()); 
      }
    } catch (error) {
      console.error("Error validating code:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Konfirmasi Voting</h2>
          <p className="text-gray-600 mb-2">Masukkan kode unik Anda untuk memilih pasangan calon</p>
          <p className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
            ⚠️ Setelah voting, kode unik akan dinonaktifkan dan tidak dapat digunakan lagi
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Pasangan Calon:</strong>
            </p>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Ketua:</span> {candidateName.ketua?.name || candidateName}
              </p>
              <p className="text-sm text-green-700">
                <span className="font-medium">Wakil Ketua:</span> {candidateName.wakilKetua?.name || ''}
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kode Unik Siswa
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Masukkan kode unik Anda"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isValidating}
          />
          {codeError && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {codeError}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isValidating}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isValidating || !inputCode.trim()}
            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memvalidasi...
              </>
            ) : (
              "Validasi & Pilih"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
