import React from "react";
import RoleGate from "../components/RoleGate";

export default function Home({ user, teamId, role }) {
  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Team Home</h1>
        <p className="muted">Signed in as {user.email}</p>
        <p className="muted">Team: {teamId}</p>
        <p className="pill">Role: {role || "player"}</p>

        <div className="row">
          <button className="btnSecondary">Film Room (coming)</button>
          <RoleGate role={role} allow={["captain", "assistant", "commissioner"]}>
            <button className="btn">Post-game entry (captains)</button>
          </RoleGate>
        </div>
      </div>
    </div>
  );
}
