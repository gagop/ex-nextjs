"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/lib/apiClient";

type ProtectedResponse = { message: string; user: string; time: string };

export default function ProtectedPage() {
  const [data, setData] = useState<ProtectedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await apiJson<ProtectedResponse>("/api/protected");
      setData(res);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 border rounded-md space-y-4">
      <h1 className="text-2xl font-semibold">Protected area</h1>
      <p className="text-sm text-gray-600">
        This calls <code>/api/protected</code>. If the access token is expired,
        the client auto-refreshes and retries.
      </p>
      <div className="flex gap-2">
        <button
          className="bg-black text-white px-3 py-2 rounded"
          onClick={load}
        >
          Fetch protected data
        </button>
        <a className="underline" href="/auth">
          Go to Login
        </a>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="border rounded p-3">
          <p>
            <strong>Message:</strong> {data.message}
          </p>
          <p>
            <strong>User:</strong> {data.user}
          </p>
          <p>
            <strong>Time:</strong> {data.time}
          </p>
        </div>
      )}
    </div>
  );
}
