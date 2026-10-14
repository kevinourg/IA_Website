import { NextResponse } from "next/server";
import { repo } from "@/lib/services";

export async function POST() {
  const project = await repo().createProject();
  return NextResponse.json({ id: project.id }, { status: 201 });
}
