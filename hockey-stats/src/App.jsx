import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "./firebase";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import JoinTeam from "./pages/JoinTeam";
import Home from "./pages/Home";

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const [teamId, setTeamId] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setTeamId(null);
      setRole(null);

      if (!u) {
        setBooting(false);
        return;
      }

      setLoadingTeam(true);

      // We don’t know the team yet. We’ll check a single known team approach later,
      // but for now assume we’ll store "currentTeamId" on the user doc once they join.
      const userRef = doc(db, "users", u.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.currentTeamId) {
          setTeamId(data.currentTeamId);

          const memberRef = doc(db, "teams", data.currentTeamId, "members", u.uid);
          const memberSnap = await getDoc(memberRef);
          if (memberSnap.exists()) setRole(memberSnap.data().role || "player");
        }
      }

      setLoadingTeam(false);
      setBooting(false);
    });

    return () => unsub();
  }, []);

  async function handleJoined(newTeamId) {
    // Save “currentTeamId” on the user doc so we can load it fast next time.
    const { setDoc, serverTimestamp } = await import("firebase/firestore");
    await setDoc(
      doc(db, "users", user.uid),
      {
        currentTeamId: newTeamId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setTeamId(newTeamId);

    // pull role (likely player)
    const memberRef = doc(db, "teams", newTeamId, "members", user.uid);
    const memberSnap = await getDoc(memberRef);
    setRole(memberSnap.exists() ? (memberSnap.data().role || "player") : "player");
  }

  if (booting) return <div className="page"><div className="muted">Loading…</div></div>;

  return (
    <Routes>
      <Route path="/login" element={<Login user={user} onDone={() => {}} />} />

      <Route
        path="/join"
        element={
          <ProtectedRoute user={user}>
            <JoinTeam user={user} onJoined={handleJoined} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            {loadingTeam ? (
              <div className="page"><div className="muted">Loading team…</div></div>
            ) : !teamId ? (
              <Navigate to="/join" replace />
            ) : (
              <Home user={user} teamId={teamId} role={role} />
            )}
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
