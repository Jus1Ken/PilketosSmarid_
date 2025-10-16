import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Results from "./components/Results.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Login from "./components/Login.jsx";
import Modal from "./components/Modal.jsx";
import { VotingProvider, useVoting } from "./context/VotingContext.jsx";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useVoting();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};


const PublicRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useVoting();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/admin" replace /> : children;
};

const VotingWebsiteContent = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  const { uniqueCode, setUniqueCode, validateCode, codeError, handleVote } = useVoting();

  const openModal = (candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCandidate(null);
  };

  const confirmVote = async (validatedCode) => {
    if (!selectedCandidate) return;
    try {
      await handleVote(selectedCandidate.id, validatedCode);
      closeModal();
    } catch (error) {
      console.error("Voting error:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home openModal={openModal} />} />
        <Route path="/results" element={<Results />} />

        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmVote}
        candidateName={selectedCandidate}
        uniqueCode={uniqueCode}
        setUniqueCode={setUniqueCode}
        validateCode={validateCode}
        codeError={codeError}
      />
    </div>
  );
};

const VotingWebsite = () => {
  return (
    <VotingProvider>
      <Router>
        <VotingWebsiteContent />
      </Router>
    </VotingProvider>
  );
};

export default VotingWebsite;
