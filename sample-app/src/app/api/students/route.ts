import { NextRequest } from "next/server";
import { z } from "zod";
import path from "path";
import { promises as fs } from "fs";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(5),
});

export type Student = { id: number; firstName: string; lastName: string; email: string };
export type PaginatedStudents = {
  data: Student[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

async function readStudents(): Promise<Student[]> {
  const filePath = path.join(process.cwd(), "public", "api", "students.json");
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);
  return { data, page: currentPage, pageSize, totalItems, totalPages };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { page, pageSize } = parsed.data;

  // Simulate backend processing delay
  await sleep(800);

  const students = await readStudents();
  const result = paginate<Student>(students, page, pageSize);

  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}
