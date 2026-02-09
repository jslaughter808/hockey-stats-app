import React from "react";

export default function RoleGate({ role, allow = [], children, fallback = null }) {
  if (!role) return fallback;
  if (!allow.includes(role)) return fallback;
  return children;
}
