'use client'

import { useCallback, useEffect, useState } from 'react'
import DataGrid, { Column } from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import { createExpense, deleteExpense, getExpenses, updateExpense } from '@/actions/expense'
import { Expense } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

const CUID_REGEX = /^c[^\s-]{8,}$/i;

interface CustomExpense extends Expense {
  _isNew?: boolean;
  _isDeleted?: boolean;
  category: string | null;
  description: string | null;
}

const defaultRow: Partial<CustomExpense> = {
  date: new Date(),
  type: 'EXPENSE',
  amount: 0.01,
  description: '',
  category: '',
  _isNew: true
}

export default function ExpenseSpreadsheet({ propertyId }: { propertyId: string }) {
  const [rows, setRows] = useState<CustomExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tempIdCounter, setTempIdCounter] = useState(0)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Partial<CustomExpense> | null>(null)

  // Add the missing handleRowChange function
  const handleRowChange = useCallback((updatedRows: CustomExpense[]) => {
    setRows(updatedRows)
  }, [])

  const columns: Column<CustomExpense>[] = [
    { 
      key: 'date',
      name: 'Date',
      renderEditCell: (p) => (
        <input
          type="date"
          className="w-full px-2 py-1"
          value={format(p.row.date, 'yyyy-MM-dd')}
          onChange={e => p.onRowChange({ ...p.row, date: new Date(e.target.value) })}
          required
        />
      ),
      renderCell: ({ row }) => format(row.date, 'MM/dd/yyyy')
    },
    { 
      key: 'category',
      name: 'Category',
      renderEditCell: (p) => (
        <select
          className="w-full px-2 py-1"
          value={p.row.category || ''}
          onChange={e => p.onRowChange({ ...p.row, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {['Utilities', 'Rent', 'Maintenance', 'Taxes', 'Insurance', 'Other'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    },
    { 
      key: 'type',
      name: 'Type',
      renderEditCell: (p) => (
        <select
          className="w-full px-2 py-1"
          value={p.row.type}
          onChange={e => p.onRowChange({ ...p.row, type: e.target.value as 'EXPENSE' | 'INCOME' })}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      )
    },
    { 
      key: 'amount',
      name: 'Amount',
      renderEditCell: (p) => (
        <input
          type="number"
          className="w-full px-2 py-1"
          defaultValue={p.row.amount?.toFixed(2)}
          step="0.01"
          min="0.01"
          required
          onFocus={(e) => e.target.select()}
          onChange={e => {
            const value = parseFloat(e.target.value)
            p.onRowChange({ 
              ...p.row, 
              amount: isNaN(value) ? 0.01 : Math.max(0.01, value)
            })
          }}
        />
      ),
      renderCell: ({ row }) => `$${row.amount?.toFixed(2)}`
    },
    { 
      key: 'description',
      name: 'Description',
      renderEditCell: (p) => (
        <input
          type="text"
          className="w-full px-2 py-1"
          value={p.row.description || ''}
          onChange={e => p.onRowChange({ ...p.row, description: e.target.value })}
        />
      )
    },
    {
      key: 'actions',
      name: 'Actions',
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          {editingRow === row.id ? (
            <>
              <button
                className="text-green-600 hover:text-green-800 px-2"
                onClick={() => handleSaveEdit(row)}
              >
                Save
              </button>
              <button
                className="text-gray-600 hover:text-gray-800 px-2"
                onClick={() => handleCancelEdit(row)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                className="text-blue-600 hover:text-blue-800 px-2"
                onClick={() => handleStartEdit(row)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:text-red-800 px-2"
                onClick={() => handleDelete(row)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getExpenses(propertyId)
        if (result.success) {
          setRows(result.expenses?.map(e => ({
            ...e,
            date: new Date(e.date),
            category: e.category || '',
            description: e.description || ''
          })) || [])
        }
      } catch (error) {
        toast.error('Failed to load expenses')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [propertyId])

  const handleStartEdit = (row: CustomExpense) => {
    setEditingRow(row.id)
    setEditedValues({ ...row })
  }

  const handleSaveEdit = async (row: CustomExpense) => {
    try {
      const result = await updateExpense({
        id: row.id,
        propertyId: row.propertyId,
        date: row.date,
        category: row.category,
        type: row.type,
        amount: row.amount,
        description: row.description
      })

      if (result.success) {
        toast.success('Changes saved')
        setEditingRow(null)
        setEditedValues(null)
      }
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const handleCancelEdit = (row: CustomExpense) => {
    setRows(prev => prev.map(r => 
      r.id === row.id ? { ...editedValues, ...r } as CustomExpense : r
    ))
    setEditingRow(null)
    setEditedValues(null)
  }

  const handleAddRow = () => {
    const newRow: CustomExpense = {
      ...defaultRow,
      id: `new-${tempIdCounter}`,
      propertyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      amount: 0.01,
      category: '',
      description: ''
    } as CustomExpense
    
    setTempIdCounter(prev => prev + 1)
    setRows(prev => [newRow, ...prev])
  }

  const handleDelete = async (row: CustomExpense) => {
    if (row._isNew) {
      setRows(prev => prev.filter(r => r.id !== row.id))
      return
    }

    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const result = await deleteExpense(row.id)
      if (result.success) {
        toast.success('Record deleted')
        setRows(prev => prev.filter(r => r.id !== row.id))
      }
    } catch (error) {
      toast.error('Failed to delete record')
    }
  }

  const handleSaveNewRows = async () => {
    setIsSaving(true)
    try {
      const newRows = rows.filter(row => row._isNew)
      const validRows = newRows.filter(row => 
        typeof row.amount === 'number' &&
        row.amount > 0 && 
        row.date instanceof Date && 
        row.type && 
        row.propertyId
      )

      const results = await Promise.all(
        validRows.map(row =>
          createExpense({
            date: row.date,
            type: row.type,
            amount: row.amount,
            category: row.category || null,
            description: row.description || null,
            propertyId: row.propertyId,
          })
        )
      )

      setRows(prev => prev.map(row => {
        if (!row._isNew) return row
        const savedResult = results.find(r => r.success && r.expense?.id)
        return savedResult?.expense 
          ? { 
              ...savedResult.expense, 
              _isNew: false,
              category: savedResult.expense.category || '',
              description: savedResult.expense.description || ''
            } 
          : row
      }))

      toast.success(`Saved ${results.filter(r => r.success).length} records`)
    } catch (error) {
      toast.error('Error saving new records')
    } finally {
      setIsSaving(false)
    }
  }

  const rowClass = (row: CustomExpense) => 
    row._isNew ? 'bg-yellow-50' : editingRow === row.id ? 'bg-blue-50' : ''

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="flex flex-col gap-4 h-[700px]">
      <div className="flex gap-3">
        <button
          onClick={handleAddRow}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Row
        </button>
        
        {rows.some(r => r._isNew) && (
          <button
            onClick={handleSaveNewRows}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save New Rows'}
          </button>
        )}
        
        {editingRow && (
          <button
            onClick={() => handleCancelEdit(rows.find(r => r.id === editingRow)!)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={handleRowChange}
        rowHeight={40}
        headerRowHeight={40}
        rowKeyGetter={row => row.id}
        className="rdg-light border rounded-lg flex-grow"
        style={{ height: '100%' }}
        rowClass={rowClass}
      />
    </div>
  )
}