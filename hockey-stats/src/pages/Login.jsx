import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

export default function Login({ user, onDone }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState("signin"); // signin | signup
  const [err, setErr] = useState("");

  async function handleSubmit() {
    setErr("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), pw);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), pw);
      }
      onDone();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Hockey Stats</h2>
        <p className="small">{mode === "signup" ? "Create an account" : "Sign in"}</p>

        <div className="row">
          <div className="col">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="col">
            <label>Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {err && <p className="small" style={{ color: "var(--danger)" }}>{err}</p>}

        <div className="row" style={{ marginTop: 12 }}>
          <button onClick={handleSubmit}>
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <button
            className="secondary"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
          </button>
        </div>

        {user && (
          <div style={{ marginTop: 12 }}>
            <p className="small">Signed in as {user.email}</p>
            <button className="secondary" onClick={handleSignOut}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}
