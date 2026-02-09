import { auth, db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function makeJoinCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createTeam({ name }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");

  const joinCode = makeJoinCode();

  // 1) Create team doc
  const teamRef = doc(collection(db, "teams")); // auto-id
  await setDoc(teamRef, {
    name,
    joinCode,
    createdAt: serverTimestamp(),
    createdByUid: user.uid,
    active: true,
  });

  // 2) Add creator as admin member
  const memberRef = doc(db, "teams", teamRef.id, "members", user.uid);
  await setDoc(memberRef, {
    role: "admin",
    displayName: user.displayName || "",
    joinedAt: serverTimestamp(),
    playerId: null,
  });

  return { teamId: teamRef.id, joinCode };
}

export async function joinTeamByCode({ joinCode }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");

  const code = joinCode.trim().toUpperCase();

  // Find the team by joinCode
  const q = query(collection(db, "teams"), where("joinCode", "==", code));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error("No team found with that code.");

  const teamDoc = snap.docs[0];
  const teamId = teamDoc.id;

  // Add membership
  const memberRef = doc(db, "teams", teamId, "members", user.uid);
  await setDoc(memberRef, {
    role: "player",
    displayName: user.displayName || "",
    joinedAt: serverTimestamp(),
    playerId: null,
  });

  return { teamId };
}
