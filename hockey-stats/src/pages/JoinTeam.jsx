import React, { useState } from "react";
import { joinTeamWithCode } from "../lib/team";

export default function JoinTeam({ user, onJoined }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { teamId } = await joinTeamWithCode({ userId: user.uid, code });
      onJoined(teamId);
    } catch (e2) {
      setErr(e2.message || "Failed to join team.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Join your team</h1>
        <p className="muted">
          Enter the code from your captain/commissioner. You’ll be added as a player by default.
        </p>

        <form onSubmit={handleJoin} className="form">
          <label className="label">Team code</label>
          <input
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ex: PEAKS-2026-A"
            autoComplete="off"
          />

          {err ? <div className="error">{err}</div> : null}

          <button className="btn" disabled={busy || !code.trim()}>
            {busy ? "Joining..." : "Join Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
