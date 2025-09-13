"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "@/lib/apiClient";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type PaginatedStudents = {
  data: Student[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

async function fetchStudents(
  page: number,
  pageSize: number,
  signal?: AbortSignal
): Promise<PaginatedStudents> {
  return apiJson<PaginatedStudents>(
    `/api/students?page=${page}&pageSize=${pageSize}`,
    { cache: "no-store", signal }
  );
}

export default function StudentsTable({
  initial,
}: {
  initial: PaginatedStudents;
}) {
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [data, setData] = useState<Student[]>(initial.data);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [totalItems, setTotalItems] = useState(initial.totalItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStudents(page, pageSize, controller.signal);
        setData(res.data);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    // Skip fetch if on first render and state equals initial
    if (page === initial.page && pageSize === initial.pageSize) return;
    load();
    return () => controller.abort();
  }, [page, pageSize, initial.page, initial.pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const info = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    return `${start}-${end} of ${totalItems}`;
  }, [page, pageSize, totalItems]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong>Students</strong>
        <span style={{ color: "#666" }}>{info}</span>
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                ID
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                First name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Last name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 8,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                  Loading…
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: "#b91c1c" }}>
                  Error: {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 16, textAlign: "center" }}>
                  No data
                </td>
              </tr>
            ) : (
              data.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {s.id}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {s.firstName}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {s.lastName}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                    {s.email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Page size</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            disabled={loading}
          >
            {[5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
