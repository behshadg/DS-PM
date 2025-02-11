'use server'

import prisma from "../lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const CUID_REGEX = /^c[^\s-]{8,}$/i;

const ExpenseCreateSchema = z.object({
  date: z.coerce.date(),
  category: z.string().nullable().optional(),
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  description: z.string().nullable().optional(),
  propertyId: z.string().refine(val => CUID_REGEX.test(val), {
    message: "Invalid property ID format"
  })
});

const ExpenseUpdateSchema = ExpenseCreateSchema.extend({
  id: z.string().refine(val => CUID_REGEX.test(val), {
    message: "Invalid expense ID format"
  })
});

export async function createExpense(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = ExpenseCreateSchema.parse(data);

    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId, ownerId: user.id }
    });

    if (!property) throw new Error("Property not found or unauthorized");

    const expense = await prisma.expense.create({ data: validatedData });
    return { success: true, expense };
  } catch (error) {
    console.error("Expense creation failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create expense" };
  }
}

export async function updateExpense(data: unknown) {
  try {
    const user = await getCurrentUser();
    const validatedData = ExpenseUpdateSchema.parse(data);

    const existingExpense = await prisma.expense.findFirst({
      where: { id: validatedData.id, property: { ownerId: user.id } }
    });

    if (!existingExpense) throw new Error("Expense not found or unauthorized");

    const updatedExpense = await prisma.expense.update({
      where: { id: validatedData.id },
      data: validatedData
    });

    return { success: true, expense: updatedExpense };
  } catch (error) {
    console.error("Expense update failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update expense" };
  }
}

// Keep deleteExpense and getExpenses functions as original

export async function deleteExpense(expenseId: string) {
  try {
    const user = await getCurrentUser();

    // Verify ownership before deletion
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        property: {
          ownerId: user.id,
        },
      },
    });

    if (!existingExpense) {
      throw new Error("Expense not found or unauthorized");
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return { success: true };
  } catch (error) {
    console.error("Expense deletion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expense",
    };
  }
}

export async function getExpenses(propertyId: string) {
  try {
    // Validate input before database call
    if (!CUID_REGEX.test(propertyId)) {
      throw new Error("Invalid property ID format");
    }

    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const property = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id },
      select: { id: true }
    });

    if (!property) throw new Error("Property not found");

    const expenses = await prisma.expense.findMany({
      where: { propertyId },
      orderBy: { date: "desc" },
    });

    return { success: true, expenses };
  } catch (error) {
    console.error("Expenses fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch expenses",
    };
  }
}