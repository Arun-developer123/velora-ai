'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('John Doe');

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Your Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
          />
        </div>

        <button className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </main>
  );
}
