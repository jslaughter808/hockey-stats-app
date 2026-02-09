import { useMemo, useState } from "react";

function formatSvPct(sa, ga) {
  if (!Number.isFinite(sa) || sa <= 0) return "—";
  if (!Number.isFinite(ga) || ga < 0 || ga > sa) return "—";
  const sv = (sa - ga) / sa;
  const rounded = Math.round(sv * 1000) / 1000; // 3 decimals
  return rounded.toFixed(3).replace(/^0/, ""); // "0.900" -> ".900"
}

export default function GameEntry({ onBack }) {
  const [us, setUs] = useState(0);
  const [them, setThem] = useState(0);

  const [teamShots, setTeamShots] = useState(0);
  const [pim, setPim] = useState(0);
  const [hits, setHits] = useState(0);

  const [foW, setFoW] = useState(0);
  const [foL, setFoL] = useState(0);

  const [sa, setSa] = useState(0);

  const ga = them; // derived from opponent score
  const svPct = useMemo(() => formatSvPct(sa, ga), [sa, ga]);

  const foPct = useMemo(() => {
    const total = foW + foL;
    if (total <= 0) return "—";
    return ((foW / total) * 100).toFixed(0) + "%";
  }, [foW, foL]);

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2>Post-Game Entry</h2>
          <button className="secondary" onClick={onBack}>Back</button>
        </div>
        <p className="small">
          Enter totals after the game. (Goals + assists + clips come next.)
        </p>
      </div>

      <div className="card">
        <h3>Final Score</h3>
        <div className="row">
          <div className="col">
            <label>Us</label>
            <input type="number" value={us} onChange={(e) => setUs(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Them</label>
            <input type="number" value={them} onChange={(e) => setThem(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Team Totals</h3>
        <div className="row">
          <div className="col">
            <label>Shots on Goal</label>
            <input type="number" value={teamShots} onChange={(e) => setTeamShots(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Penalty Minutes (PIM)</label>
            <input type="number" value={pim} onChange={(e) => setPim(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Hits (team total)</label>
            <input type="number" value={hits} onChange={(e) => setHits(Number(e.target.value))} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <div className="col">
            <label>Faceoff Wins</label>
            <input type="number" value={foW} onChange={(e) => setFoW(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Faceoff Losses</label>
            <input type="number" value={foL} onChange={(e) => setFoL(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Faceoff %</label>
            <input value={foPct} readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Goalie Totals</h3>
        <div className="row">
          <div className="col">
            <label>Shots Against (SA)</label>
            <input type="number" value={sa} onChange={(e) => setSa(Number(e.target.value))} />
          </div>
          <div className="col">
            <label>Goals Against (GA)</label>
            <input value={ga} readOnly />
          </div>
          <div className="col">
            <label>Game SV%</label>
            <input value={svPct} readOnly />
          </div>
        </div>

        <p className="small">
          SV% displays like pro hockey (.900). Season SV% will be weighted across games later.
        </p>
      </div>

      <div className="card">
        <button onClick={() => alert("Next: save to Firestore!")}>
          Save Game (placeholder)
        </button>
      </div>
    </div>
  );
}
