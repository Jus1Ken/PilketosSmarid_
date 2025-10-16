import { Settings, Upload, Plus, Edit2, Trash2, Key, Users, Download, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useVoting } from "../context/VotingContext";
import axios from "axios";

const AdminPanel = () => {
  const {
    candidates,
    setCandidates,
    newCandidate,
    setNewCandidate,
    editingCandidate,
    setEditingCandidate,
    fileInputRef,
    handleImageUpload,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addMisiField,
    updateMisi,
  } = useVoting();

  const [uniqueCode, setUniqueCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [codeError, setCodeError] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState("");
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // State untuk form create admin
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreateUniqueCode = async () => {
    if (!uniqueCode || !studentName) {
      setCodeError("Kode unik dan nama siswa harus diisi");
      return;
    }

    try {
      const response = await axios.post("/api/admin/create-unique-code", {
        uniqueCode,
        studentName,
      });
      setCodeMessage("Kode unik berhasil dibuat!");
      setCodeError("");
      setUniqueCode("");
      setStudentName("");
    } catch (error) {
      setCodeError(error.response?.data?.message || "Gagal membuat kode unik");
      setCodeMessage("");
    }
  };

  const handleGenerateRandomCode = () => {
    setUniqueCode(generateRandomCode());
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvError("");
    } else {
      setCsvFile(null);
      setCsvError("File harus berformat CSV");
    }
  };

  const handleUploadCsv = async () => {
    if (!csvFile) {
      setCsvError("Pilih file CSV terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setCsvError("");
    setCsvMessage("");

    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);

      const response = await axios.post("/api/admin/upload-unique-codes-csv", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCsvMessage(response.data.message);
      setCsvFile(null);
      
      const fileInput = document.getElementById('csvFileInput');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.existingCodes) {
        setCsvError(`Kode unik sudah ada: ${errorData.existingCodes.join(', ')}`);
      } else if (errorData?.duplicates) {
        setCsvError(`Duplikat dalam file: ${errorData.duplicates.join(', ')}`);
      } else {
        setCsvError(errorData?.message || "Gagal upload file CSV");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get("/api/admin/export-winner-pdf", {
        responseType: 'blob', // Important for downloading files
      });


      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hasil-voting.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert("PDF berhasil didownload!");
    } catch (error) {
      console.error('PDF download error:', error);
      alert("Gagal mendownload PDF: " + (error.response?.data?.message || error.message));
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminUsername || !newAdminPassword || !confirmPassword) {
      setAdminError("Username, password, dan konfirmasi password harus diisi");
      return;
    }

    if (newAdminPassword !== confirmPassword) {
      setAdminError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (newAdminPassword.length < 6) {
      setAdminError("Password minimal 6 karakter");
      return;
    }

    setIsCreatingAdmin(true);
    setAdminError("");
    setAdminMessage("");

    try {
      const response = await axios.post("/api/admin/create-account", {
        username: newAdminUsername,
        password: newAdminPassword,
      });

      setAdminMessage("Admin baru berhasil dibuat!");
      setAdminError("");

      setNewAdminUsername("");
      setNewAdminPassword("");
      setConfirmPassword("");

    } catch (error) {
      setAdminError(error.response?.data?.message || "Gagal membuat admin baru");
      setAdminMessage("");
    } finally {
      setIsCreatingAdmin(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e)}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Settings className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Panel Admin</h2>
          <p className="text-xl text-gray-600">Kelola Kandidat Pemilihan</p>
        </div>

        {/* Form Tambah/Edit Kandidat */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingCandidate ? "Edit Kandidat" : "Tambah Kandidat Baru"}
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Ketua
              </label>
              <input
                type="text"
                value={editingCandidate ? editingCandidate.ketua.name : newCandidate.ketua.name}
                onChange={(e) => {
                  if (editingCandidate) {
                    setEditingCandidate({
                      ...editingCandidate,
                      ketua: { ...editingCandidate.ketua, name: e.target.value }
                    });
                  } else {
                    setNewCandidate({
                      ...newCandidate,
                      ketua: { ...newCandidate.ketua, name: e.target.value }
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan nama ketua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIS Ketua
              </label>
              <input
                type="text"
                value={editingCandidate ? editingCandidate.ketua.nis : newCandidate.ketua.nis}
                onChange={(e) => {
                  if (editingCandidate) {
                    setEditingCandidate({
                      ...editingCandidate,
                      ketua: { ...editingCandidate.ketua, nis: e.target.value }
                    });
                  } else {
                    setNewCandidate({
                      ...newCandidate,
                      ketua: { ...newCandidate.ketua, nis: e.target.value }
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan NIS ketua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Wakil Ketua
              </label>
              <input
                type="text"
                value={editingCandidate ? editingCandidate.wakilKetua.name : newCandidate.wakilKetua.name}
                onChange={(e) => {
                  if (editingCandidate) {
                    setEditingCandidate({
                      ...editingCandidate,
                      wakilKetua: { ...editingCandidate.wakilKetua, name: e.target.value }
                    });
                  } else {
                    setNewCandidate({
                      ...newCandidate,
                      wakilKetua: { ...newCandidate.wakilKetua, name: e.target.value }
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan nama wakil ketua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIS Wakil Ketua
              </label>
              <input
                type="text"
                value={editingCandidate ? editingCandidate.wakilKetua.nis : newCandidate.wakilKetua.nis}
                onChange={(e) => {
                  if (editingCandidate) {
                    setEditingCandidate({
                      ...editingCandidate,
                      wakilKetua: { ...editingCandidate.wakilKetua, nis: e.target.value }
                    });
                  } else {
                    setNewCandidate({
                      ...newCandidate,
                      wakilKetua: { ...newCandidate.wakilKetua, nis: e.target.value }
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan NIS wakil ketua"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visi
              </label>
              <textarea
                value={editingCandidate ? editingCandidate.visi : newCandidate.visi}
                onChange={(e) => {
                  if (editingCandidate) {
                    setEditingCandidate({
                      ...editingCandidate,
                      visi: e.target.value
                    });
                  } else {
                    setNewCandidate({
                      ...newCandidate,
                      visi: e.target.value
                    });
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan visi"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Misi
              </label>
              {(editingCandidate ? editingCandidate.misi : newCandidate.misi).map((misi, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={misi}
                    onChange={(e) => updateMisi(index, e.target.value, editingCandidate ? true : false, false)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`Misi ${index + 1}`}
                  />
                  {(editingCandidate ? editingCandidate.misi : newCandidate.misi).length > 1 && (
                    <button
                      onClick={() => {
                        if (editingCandidate) {
                          const updatedMisi = editingCandidate.misi.filter((_, i) => i !== index);
                          setEditingCandidate({
                            ...editingCandidate,
                            misi: updatedMisi
                          });
                        } else {
                          const updatedMisi = newCandidate.misi.filter((_, i) => i !== index);
                          setNewCandidate({
                            ...newCandidate,
                            misi: updatedMisi
                          });
                        }
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addMisiField(editingCandidate ? true : false, false)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Misi
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Bersama Ketua & Wakil Ketua
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('data-target', 'jointPhoto');
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Foto Bersama
                </button>
                {(editingCandidate?.jointPhoto || newCandidate.jointPhoto) && (
                  <img
                    src={editingCandidate?.jointPhoto || newCandidate.jointPhoto}
                    alt="Preview Foto Bersama"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={editingCandidate ? updateCandidate : addCandidate}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
              >
                {editingCandidate ? "Update Kandidat" : "Tambah Kandidat"}
              </button>
              {editingCandidate && (
                <button
                  onClick={() => setEditingCandidate(null)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Key className="h-6 w-6 mr-2 text-purple-600" />
            Generate Kode Unik
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Siswa
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan nama siswa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Unik
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Masukkan kode unik"
                  maxLength="8"
                />
                <button
                  onClick={handleGenerateRandomCode}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            {codeError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {codeError}
              </div>
            )}
            {codeMessage && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {codeMessage}
              </div>
            )}

            <button
              onClick={handleCreateUniqueCode}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Buat Kode Unik
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Upload className="h-6 w-6 mr-2 text-purple-600" />
            Upload Kode Unik via CSV
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Format CSV yang Diterima:</h4>
              <p className="text-sm text-blue-700 mb-2">
                File CSV harus memiliki kolom: <strong>unique_code</strong> dan <strong>student_name</strong>
              </p>
              <p className="text-xs text-blue-600">
                Contoh: unique_code,student_name<br />
                ABC12345,John Doe<br />
                DEF67890,Jane Smith
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih File CSV
              </label>
              <input
                id="csvFileInput"
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {csvFile && (
                <p className="mt-2 text-sm text-gray-600">
                  File dipilih: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {csvError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {csvError}
              </div>
            )}
            {csvMessage && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {csvMessage}
              </div>
            )}

            <button
              onClick={handleUploadCsv}
              disabled={!csvFile || isUploading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                !csvFile || isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isUploading ? 'Mengupload...' : 'Upload CSV'}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Download className="h-6 w-6 mr-2 text-purple-600" />
            Export Hasil Voting
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">PDF Hasil Voting:</h4>
              <p className="text-sm text-green-700 mb-2">
                Download PDF berisi hasil pemilihan dengan kandidat pemenang dan grafik perolehan suara.
              </p>
              <p className="text-xs text-green-600">
                PDF akan berisi salam pembuka, nama pemenang, grafik bar chart, dan pernyataan resmi.
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF Hasil Voting
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <UserPlus className="h-6 w-6 mr-2 text-purple-600" />
            Buat Akun Admin Baru
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username Admin
              </label>
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan username admin baru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Masukkan password (min. 6 karakter)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Konfirmasi password"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Catatan:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Username harus unik dan belum digunakan admin lain</li>
                <li>• Password minimal 6 karakter</li>
                <li>• Pastikan konfirmasi password sesuai dengan password</li>
                <li>• Admin baru akan dapat login dengan kredensial yang dibuat</li>
              </ul>
            </div>

            {adminError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {adminError}
              </div>
            )}
            {adminMessage && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {adminMessage}
              </div>
            )}

            <button
              onClick={handleCreateAdmin}
              disabled={isCreatingAdmin}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                isCreatingAdmin
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isCreatingAdmin ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Membuat Admin...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Buat Admin Baru
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Daftar Paslon</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={candidate.jointPhoto}
                    alt={`${candidate.ketua.name} & ${candidate.wakilKetua.name}`}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800">
                      {candidate.ketua.name} & {candidate.wakilKetua.name}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      NIS K: {candidate.ketua.nis} | NIS W: {candidate.wakilKetua.nis}
                    </p>
                    <p className="text-gray-600 text-sm">{candidate.votes} suara</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                    <strong>Visi Bersama:</strong> {candidate.visi}
                  </p>
                  <p className="text-gray-700 text-sm line-clamp-2">
                    <strong>Misi Bersama:</strong> {candidate.misi.join(', ')}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCandidate(candidate)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCandidate(candidate.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
