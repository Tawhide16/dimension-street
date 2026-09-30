"use client";

import React from "react";
import Image from "next/image";
import { Users, Shield, Plus } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    {
      id: "u-1",
      name: "Lox Admin",
      email: "admin@dimensionstreet.com",
      role: "Super Admin",
      phone: "+880 1700 000000",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: "u-2",
      name: "Rifat Chowdhury",
      email: "rifat.c@outlook.com",
      role: "Customer / VIP",
      phone: "+880 1711 234567",
      avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase text-neutral-900 font-sans tracking-tight">
            Admin Users & Role-Based Access Control
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage administrative credentials, store permissions, and consumer profiles
          </p>
        </div>

        <button
          onClick={() => alert("Invite link generated.")}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase rounded-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Admin User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200/80 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-50/60">
                <td className="py-3 px-4 flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200">
                    <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                  </div>
                  <span className="font-bold text-black font-sans">{u.name}</span>
                </td>
                <td className="py-3 px-4 text-neutral-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-neutral-500">{u.phone}</td>
                <td className="py-3 px-4">
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
