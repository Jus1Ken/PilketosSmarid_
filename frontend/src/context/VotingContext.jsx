import React, { createContext, useState, useContext, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE = '';

const VotingContext = createContext();


export const useVoting = () => useContext(VotingContext);

export const VotingProvider = ({ children }) => {

  const [candidates, setCandidates] = useState([]);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [newCandidate, setNewCandidate] = useState({
    ketua: {
      name: "",
      image: "",
      nis: "",
    },
    wakilKetua: {
      name: "",
      image: "",
      nis: "",
    },
    visi: "",
    misi: [""],
    jointPhoto: "",
  });
  const [uniqueCode, setUniqueCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [codeError, setCodeError] = useState("");
  const fileInputRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      const admin = localStorage.getItem('adminData');

      if (token && admin) {
        setIsAuthenticated(true);
        setAdminData(JSON.parse(admin));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {

    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/candidates`);
        setCandidates(response.data);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat kandidat");
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const validateCode = async (code) => {
    try {
      const trimmedCode = code.trim();
      const response = await axios.post(`${API_BASE}/api/validate-code`, { uniqueCode: trimmedCode });
      setCodeValidated(true);
      setCodeError("");
      return true;
    } catch (err) {
      setCodeValidated(false);
      setCodeError(err.response?.data?.message || "Kode unik tidak valid");
      return false;
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await axios.post(`${API_BASE}/api/admin/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Upload gagal");
    }
  };

  const handleVote = async (candidateId, validatedCode = null) => {

    try {
      const codeToUse = validatedCode || uniqueCode.trim();
      const response = await axios.post(`${API_BASE}/api/vote`, {
        candidateId,
        uniqueCode: codeToUse,
      });

      setCandidates(
        candidates.map((c) =>
          c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        )
      );
      setVotedCandidate(candidateId);
      alert("Voting berhasil!");
      return true; 
    }
    catch (err) {
      const message = err.response?.data?.message || "Voting gagal";
      alert(message);
      throw err;
    }
  };

  const addMisiField = (isEditing = false, isWakilKetua = false) => {
    if (isEditing && editingCandidate) {
      const updatedMisi = [...editingCandidate.misi, ""];
      setEditingCandidate({ ...editingCandidate, misi: updatedMisi });
    } else {
      const updatedMisi = [...newCandidate.misi, ""];
      setNewCandidate({ ...newCandidate, misi: updatedMisi });
    }
  };

  const updateMisi = (index, value, isEditing = false, isWakilKetua = false) => {
    if (isEditing && editingCandidate) {
      const updatedMisi = [...editingCandidate.misi];
      updatedMisi[index] = value;
      setEditingCandidate({ ...editingCandidate, misi: updatedMisi });
    } else {
      const updatedMisi = [...newCandidate.misi];
      updatedMisi[index] = value;
      setNewCandidate({ ...newCandidate, misi: updatedMisi });
    }
  };

  const handleImageUpload = async (e, isEditing = false, isWakilKetua = false) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);

        // Check if we have a dat-target attribute to determine which position to upload for
        const target = e.target.getAttribute('data-target') || (isWakilKetua ? 'wakilKetua' : 'ketua');

        if (target === 'ketua' || target === 'wakilKetua') {
          alert("Fitur upload foto ketua dan wakil ketua telah dihapus. Gunakan hanya foto bersama.");
          return;
        }

        if (isEditing && editingCandidate) {
          if (target === 'jointPhoto') {
            setEditingCandidate({ ...editingCandidate, jointPhoto: imageUrl });
          }
        } else {
          if (target === 'jointPhoto') {
            setNewCandidate({ ...newCandidate, jointPhoto: imageUrl });
          }
        }
      } catch (error) {
        alert("Gagal upload gambar: " + error.message);
      }
    }
  };

  const addCandidate = async () => {
    if (!newCandidate.ketua.name || !newCandidate.ketua.nis ||
        !newCandidate.wakilKetua.name || !newCandidate.wakilKetua.nis ||
        !newCandidate.visi || !newCandidate.jointPhoto) {
      alert("Semua field harus diisi.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE}/api/admin/candidates`, {
        ketua: {
          name: newCandidate.ketua.name,
          image: newCandidate.ketua.image,
          nis: newCandidate.ketua.nis,
        },
        wakilKetua: {
          name: newCandidate.wakilKetua.name,
          image: newCandidate.wakilKetua.image,
          nis: newCandidate.wakilKetua.nis,
        },
        visi: newCandidate.visi,
        misi: newCandidate.misi.filter(m => m.trim() !== ""),
        jointPhoto: newCandidate.jointPhoto,
      });

      const newCandidateData = { ...response.data.candidate, id: response.data.candidate._id };
      setCandidates([...candidates, newCandidateData]);
      setNewCandidate({
        ketua: { name: "", image: "", nis: "" },
        wakilKetua: { name: "", image: "", nis: "" },
        visi: "",
        misi: [""],
        jointPhoto: "",
      }); 
      alert("Paslon berhasil ditambahkan!");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat menambahkan paslon";
      alert("Gagal menambahkan paslon: " + message);
    }
  };

  const updateCandidate = async () => {
    if (!editingCandidate) return;
    try {
      const response = await axios.put(`${API_BASE}/api/admin/candidates/${editingCandidate.id}`, {
        ketua: {
          name: editingCandidate.ketua.name,
          image: editingCandidate.ketua.image,
          nis: editingCandidate.ketua.nis,
        },
        wakilKetua: {
          name: editingCandidate.wakilKetua.name,
          image: editingCandidate.wakilKetua.image,
          nis: editingCandidate.wakilKetua.nis,
        },
        visi: editingCandidate.visi,
        misi: editingCandidate.misi.filter(m => m.trim() !== ""),
        jointPhoto: editingCandidate.jointPhoto,
      });

      const updatedCandidateData = { ...response.data.candidate, id: response.data.candidate._id };
      setCandidates(
        candidates.map((c) =>
          c.id === editingCandidate.id ? updatedCandidateData : c
        )
      );
      setEditingCandidate(null);
      alert("Paslon berhasil diperbarui!");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat memperbarui paslon";
      alert("Gagal memperbarui paslon: " + message);
    }
  };

  const deleteCandidate = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kandidat ini?")) {
      try {
        await axios.delete(`${API_BASE}/api/admin/candidates/${id}`);
       
        setCandidates(candidates.filter((c) => c.id !== id));
        alert("Kandidat berhasil dihapus!");
      } catch (error) {
        const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat menghapus kandidat";
        alert("Gagal menghapus kandidat: " + message);
      }
    }
  };

  // Fungsi autentikasi
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/login`, {
        username,
        password
      });

      if (response.data.success) {
        const { token, admin } = response.data;

        
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));

        setIsAuthenticated(true);
        setAdminData(admin);

        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    setIsAuthenticated(false);
    setAdminData(null);

    delete axios.defaults.headers.common['Authorization'];
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const value = {
    candidates,
    setCandidates,
    votedCandidate,
    setVotedCandidate,
    editingCandidate,
    setEditingCandidate,
    newCandidate,
    setNewCandidate,
    fileInputRef,
    totalVotes,
    handleVote,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addMisiField,
    updateMisi,
    handleImageUpload,
    uploadImage,
    uniqueCode,
    setUniqueCode,
    codeValidated,
    setCodeValidated,
    codeError,
    setCodeError,
    validateCode,
    loading,
    error,
    // Authentication
    isAuthenticated,
    adminData,
    authLoading,
    login,
    logout,
  };

  return (
    <VotingContext.Provider value={value}>{children}</VotingContext.Provider>
  );
};
