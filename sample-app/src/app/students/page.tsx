import StudentsTable from "./StudentsTable";
import { headers } from "next/headers";

async function getInitialData() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const protocol = (hdrs.get("x-forwarded-proto") ?? "http").split(",")[0];
  const url = `${protocol}://${host}/api/students?page=1&pageSize=5`;

  const res = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to load initial students");
  return res.json();
}

export default async function StudentsPage() {
  const initial = await getInitialData();
  return (
    <main style={{ padding: 24 }}>
      <StudentsTable initial={initial} />
    </main>
  );
}
