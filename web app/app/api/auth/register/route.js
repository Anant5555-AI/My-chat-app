import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/mongo";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "User already exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await users.insertOne({
    email,
    passwordHash: hash,
    createdAt: new Date()
  });

  return NextResponse.json({ id: result.insertedId.toString(), email }, { status: 201 });
}


