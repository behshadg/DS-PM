// components/ExpenseSpreadsheetAG.tsx
"use client";

import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridReadyEvent, CellValueChangedEvent } from "ag-grid-community";

// Import and register the required AG Grid modules.
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, ValidationModule, ColumnAutoSizeModule } from "ag-grid-community";
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule, ColumnAutoSizeModule]);

// Import only the new theme CSS. (Do not import ag-grid.css)
import "ag-grid-community/styles/ag-theme-alpine.css";

// Define the Expense type. (This generic type will be used for any financial record.)
export type Expense = {
  id: string;
  date: string; // ISO string
  category?: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  description?: string;
  // Internal flags for tracking changes:
  _dirty?: boolean;
  _new?: boolean;
};

interface ExpenseSpreadsheetProps {
  propertyId: string;
}

export default function ExpenseSpreadsheet({ propertyId }: ExpenseSpreadsheetProps) {
  const [rowData, setRowData] = useState<Expense[]>([]);
  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "Date",
      field: "date",
      editable: true,
      // Format ISO date to a localized string.
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
      cellEditor: "agDateCellEditor",
    },
    {
      headerName: "Category",
      field: "category",
      editable: true,
    },
    {
      headerName: "Type",
      field: "type",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["EXPENSE", "INCOME"],
      },
    },
    {
      headerName: "Amount",
      field: "amount",
      editable: true,
      valueFormatter: (params) =>
        typeof params.value === "number" ? `$${params.value.toFixed(2)}` : params.value,
    },
    {
      headerName: "Description",
      field: "description",
      editable: true,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRendererFramework: (params: any) => (
        <button
          onClick={() => deleteRow(params.data.id)}
          style={{
            padding: "4px 8px",
            backgroundColor: "#DC2626",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      ),
      width: 100,
      suppressMenu: true,
      suppressSorting: true,
      suppressFilter: true,
    },
  ]);

  // Fetch expense records for the given property when the component mounts.
  useEffect(() => {
    async function fetchExpenses() {
      try {
        const res = await fetch(`/api/expenses?propertyId=${propertyId}`);
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data: Expense[] = await res.json();
        console.log("Fetched expenses:", data);
        // Mark fetched rows as saved.
        setRowData(data.map((r) => ({ ...r, _dirty: false, _new: false })));
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    }
    fetchExpenses();
  }, [propertyId]);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  // When a cell value changes, mark the row as dirty.
  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const updatedRow: Expense = { ...params.data, _dirty: true };
    setRowData((prev) =>
      prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
    );
    console.log("Cell updated:", updatedRow);
  };

  // Add a new row. New rows get a temporary ID (prefixed with "temp-") and are marked as new.
  const addNewRow = () => {
    const newRow: Expense = {
      id: "temp-" + Date.now().toString(),
      date: new Date().toISOString(),
      category: "",
      type: "EXPENSE",
      amount: 0,
      description: "",
      _new: true,
      _dirty: true,
    };
    setRowData((prev) => [...prev, newRow]);
  };

  // Delete a row.
  const deleteRow = async (id: string) => {
    if (id.startsWith("temp-")) {
      // For new rows not saved yet, just remove from state.
      setRowData((prev) => prev.filter((row) => row.id !== id));
    } else {
      // For saved rows, call the DELETE API endpoint.
      try {
        const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to delete expense");
        }
        setRowData((prev) => prev.filter((row) => row.id !== id));
      } catch (error: any) {
        console.error("Error deleting row:", error);
        alert("Error deleting row: " + error.message);
      }
    }
  };

  // Save changes for all dirty rows.
  // For new rows (id starts with "temp-") use POST; for existing ones use PATCH.
  const saveChanges = async () => {
    const savePromises = rowData
      .filter((row) => row._dirty)
      .map(async (row) => {
        if (row._new) {
          // POST to create a new record.
          const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: row.date,
              category: row.category,
              type: row.type,
              amount: row.amount,
              description: row.description,
              propertyId,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to create expense");
          }
          const savedRow: Expense = await res.json();
          return { ...savedRow, _new: false, _dirty: false };
        } else {
          // PATCH to update an existing record.
          const res = await fetch("/api/expenses", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: row.id,
              date: row.date,
              category: row.category,
              type: row.type,
              amount: row.amount,
              description: row.description,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update expense");
          }
          const updatedRow: Expense = await res.json();
          return { ...updatedRow, _dirty: false };
        }
      });

    try {
      const results = await Promise.all(savePromises);
      // Merge the updated rows back into state.
      setRowData((prev) =>
        prev.map((row) => {
          const saved = results.find((r) => r.id === row.id || (row._new && r.id));
          return saved ? saved : row;
        })
      );
      alert("Changes saved successfully!");
    } catch (error: any) {
      console.error("Error saving changes:", error);
      alert("Error saving changes: " + error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button
          onClick={addNewRow}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add New Row
        </button>
        <button
          onClick={saveChanges}
          style={{
            padding: "8px 16px",
            backgroundColor: "#16A34A",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Changes
        </button>
      </div>
      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          onGridReady={onGridReady}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          defaultColDef={{
            flex: 1,
            resizable: true,
            sortable: true,
            filter: true,
          }}
          singleClickEdit={true}
        />
      </div>
    </div>
  );
}
