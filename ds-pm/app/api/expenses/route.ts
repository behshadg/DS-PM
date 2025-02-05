// app/api/expenses/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: Fetch expenses for a given property.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  // Ensure the user is authenticated.
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { propertyId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST: Create a new expense.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, category, type, amount, description, propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { error: "Missing propertyId" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        category,
        type,
        amount: parseFloat(amount),
        description,
        property: { connect: { id: propertyId } },
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creating expense" },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing expense.
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, date, category, type, amount, description } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(date),
        category,
        type,
        amount: parseFloat(amount),
        description,
      },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating expense" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an expense.
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing expense id" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.delete({
      where: { id },
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting expense" },
      { status: 500 }
    );
  }
}
