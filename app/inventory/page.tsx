'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Database,
  Plus,
  Trash2,
  Home,
  Search,
  Package,
  Layers,
  CheckSquare,
  Square,
  Edit3,
  Download,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  location: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Individual Manual Form States
  const [singleName, setSingleName] = useState('');
  const [singleQty, setSingleQty] = useState<number>(1);
  const [singleUnit, setSingleUnit] = useState('pcs');
  const [singleLocation, setSingleLocation] = useState('');

  // Selection Filters (Bulk Actions)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkUpdateQty, setBulkUpdateQty] = useState<string>('');
  const [bulkUpdateLocation, setBulkUpdateLocation] = useState<string>('');

  // INLINE ROW EDITING STATES
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('master_lab_inventory');
    if (saved) {
      setInventory(JSON.parse(saved));
    } else {
      const startingSeed = [
        {
          id: '1',
          item_name: 'ANTAGONISTIC MUSCLES',
          quantity: 2,
          unit: 'pcs',
          location: 'bio cupboard 1',
        },
        {
          id: '2',
          item_name: 'EYE MODEL LARGE',
          quantity: 2,
          unit: 'pcs',
          location: 'bio cupboard 1',
        },
        {
          id: '3',
          item_name: 'PUMPING HEART',
          quantity: 3,
          unit: 'SETS',
          location: 'bio cupboard 1',
        },
      ];
      setInventory(startingSeed);
      localStorage.setItem(
        'master_lab_inventory',
        JSON.stringify(startingSeed)
      );
    }
  }, []);

  const saveToStorage = (updatedList: InventoryItem[]) => {
    setInventory(updatedList);
    localStorage.setItem('master_lab_inventory', JSON.stringify(updatedList));
  };

  const handleAddSingleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) return;

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      item_name: singleName,
      quantity: Number(singleQty),
      unit: singleUnit,
      location: singleLocation || 'Unassigned',
    };

    saveToStorage([newItem, ...inventory]);
    setSingleName('');
    setSingleQty(1);
    setSingleLocation('');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const parsedBulkItems: InventoryItem[] = data.map((row, index) => {
        const rowKeys = Object.keys(row);
        const nameKey =
          rowKeys.find(
            (k) =>
              k.toLowerCase().includes('name') ||
              k.toLowerCase().includes('item') ||
              k.toLowerCase().includes('product')
          ) || '';
        const qtyKey =
          rowKeys.find(
            (k) =>
              k.toLowerCase().includes('qty') ||
              k.toLowerCase().includes('quantity') ||
              k.toLowerCase().includes('count')
          ) || '';
        const unitKey =
          rowKeys.find((k) => k.toLowerCase().includes('unit')) || '';
        const locKey =
          rowKeys.find(
            (k) =>
              k.toLowerCase().includes('loc') ||
              k.toLowerCase().includes('shelf') ||
              k.toLowerCase().includes('cabinet')
          ) || '';

        return {
          id: `excel-${Date.now()}-${index}`,
          item_name: row[nameKey] ? String(row[nameKey]) : 'Unnamed Item',
          quantity: row[qtyKey] ? Number(row[qtyKey]) : 0,
          unit: row[unitKey] ? String(row[unitKey]) : 'pcs',
          location: row[locKey] ? String(row[locKey]) : 'Unassigned',
        };
      });

      const cleanBulkItems = parsedBulkItems.filter(
        (item) => item.item_name !== 'Unnamed Item'
      );
      saveToStorage([...cleanBulkItems, ...inventory]);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // INLINE QUANTITY UPDATE FUNCTION
  const startInlineEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity);
  };

  const saveInlineEdit = (id: string) => {
    const updated = inventory.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: editQty };
      }
      return item;
    });
    saveToStorage(updated);
    setEditingId(null);
  };

  const handleExportToExcel = () => {
    if (inventory.length === 0) return;
    const exportData = inventory.map((item) => ({
      'Item Name': item.item_name,
      Quantity: item.quantity,
      Unit: item.unit,
      Location: item.location,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lab Inventory');
    XLSX.writeFile(workbook, 'Master_Lab_Inventory_Report.xlsx');
  };

  const handleClearAllInventory = () => {
    if (inventory.length === 0) return;
    if (!confirm('🚨 Wipe out ALL stock records in your database?')) return;
    saveToStorage([]);
    setSelectedItemIds([]);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleItems: InventoryItem[]) => {
    if (selectedItemIds.length === visibleItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(visibleItems.map((item) => item.id));
    }
  };

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) return;

    const updatedInventory = inventory.map((item) => {
      if (selectedItemIds.includes(item.id)) {
        return {
          ...item,
          quantity:
            bulkUpdateQty !== '' ? Number(bulkUpdateQty) : item.quantity,
          location:
            bulkUpdateLocation !== '' ? bulkUpdateLocation : item.location,
        };
      }
      return item;
    });

    saveToStorage(updatedInventory);
    setBulkUpdateQty('');
    setBulkUpdateLocation('');
    setSelectedItemIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedItemIds.length === 0) return;
    if (!confirm(`Delete the ${selectedItemIds.length} selected items?`))
      return;
    const updated = inventory.filter(
      (item) => !selectedItemIds.includes(item.id)
    );
    saveToStorage(updated);
    setSelectedItemIds([]);
  };

  const filteredStocks = inventory.filter(
    (item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800 max-w-6xl mx-auto flex flex-col gap-6">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-xs">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Database className="text-emerald-600" size={20} /> Master Stock
            Control Center
          </h1>
          <p className="text-[11px] text-gray-400">
            NEWTON BRITISH SCHOOL MURAIKH LABORATORY SYSTEM • Designed by Mariam
            Selim
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 bg-white px-3 py-1.5 rounded-lg border shadow-sm transition"
        >
          <Home size={12} /> Main Hub
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers size={14} /> Bulk Spreadsheet Import
            </h2>
            <p className="text-[11px] text-gray-400 mb-4">
              Upload layout files to map a comprehensive batch matrix.
            </p>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition p-4 text-center">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <p className="text-xs text-gray-600 font-semibold">
              Click to upload spreadsheet
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              Accepts .xlsx, .xls, and .csv data lists
            </p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </label>
        </div>

        <form
          onSubmit={handleAddSingleItem}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-3"
        >
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Plus size={14} /> Add Individual Stock Line
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3">
              <input
                type="text"
                required
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="Item Classification Name"
                className="w-full border p-2 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="col-span-1">
              <input
                type="number"
                required
                min={1}
                value={singleQty}
                onChange={(e) => setSingleQty(Number(e.target.value))}
                placeholder="Qty"
                className="w-full border p-2 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="col-span-1">
              <select
                value={singleUnit}
                onChange={(e) => setSingleUnit(e.target.value)}
                className="w-full border p-2 rounded-lg text-xs bg-white outline-none"
              >
                <option value="pcs">pcs</option>
                <option value="bottles">bottles</option>
                <option value="boxes">boxes</option>
                <option value="SETS">SETS</option>
              </select>
            </div>
            <div className="col-span-1">
              <input
                type="text"
                value={singleLocation}
                onChange={(e) => setSingleLocation(e.target.value)}
                placeholder="Cabinet / Shelf"
                className="w-full border p-2 rounded-lg text-xs outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs transition"
          >
            Insert Item
          </button>
        </form>
      </div>

      {/* LOWER MONITOR TABLE PANEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <Package size={16} className="text-gray-500" />
            <h2 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
              Live Inventory Warehouse Monitor ({inventory.length} items)
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full justify-end max-w-2xl">
            <div className="relative w-full max-w-xs">
              <Search
                size={12}
                className="absolute left-2.5 top-2.5 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter catalog list..."
                className="w-full pl-7 pr-3 py-1.5 bg-white border rounded-lg text-[11px] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExportToExcel}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-indigo-700 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download size={12} /> Export Excel
            </button>

            <button
              type="button"
              onClick={handleClearAllInventory}
              disabled={inventory.length === 0}
              className="bg-white hover:bg-red-50 text-red-600 disabled:opacity-30 text-[11px] font-extrabold px-3 py-1.5 rounded-lg border border-red-200 transition flex items-center gap-1.5 shadow-2xs"
            >
              <AlertTriangle size={12} /> Wipe All Records
            </button>
          </div>
        </div>

        {/* MASS CHANGE INTERFACE ROW */}
        {selectedItemIds.length > 0 && (
          <form
            onSubmit={handleBulkUpdateSubmit}
            className="bg-amber-50/70 border-b border-amber-200 p-3 flex items-center justify-between text-xs gap-4 animate-fadeIn"
          >
            <div className="flex items-center gap-2 text-amber-900 font-semibold shrink-0">
              Selected{' '}
              <span className="bg-amber-200 px-1.5 py-0.5 rounded text-amber-950 font-black">
                {selectedItemIds.length}
              </span>{' '}
              items:
            </div>
            <div className="flex items-center gap-2 flex-1 justify-start max-w-xl">
              <input
                type="number"
                min={0}
                value={bulkUpdateQty}
                onChange={(e) => setBulkUpdateQty(e.target.value)}
                placeholder="Change Qty to..."
                className="border bg-white rounded-md px-2 py-1 text-[11px] w-28"
              />
              <input
                type="text"
                value={bulkUpdateLocation}
                onChange={(e) => setBulkUpdateLocation(e.target.value)}
                placeholder="Change Location to..."
                className="border bg-white rounded-md px-2 py-1 text-[11px] w-44"
              />
              <button
                type="submit"
                className="bg-slate-800 text-white font-bold px-3 py-1 rounded-md text-[11px]"
              >
                Apply Mass Update
              </button>
            </div>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="text-red-700 hover:bg-red-100 px-3 py-1 rounded-md border border-red-200 text-[11px] font-bold transition flex items-center gap-1"
            >
              Mass Delete
            </button>
          </form>
        )}

        {/* DATA TABLE VIEW */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 border-b font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={() => toggleSelectAll(filteredStocks)}
                    className="text-gray-400 hover:text-slate-700 inline-flex items-center"
                  >
                    {selectedItemIds.length === filteredStocks.length &&
                    filteredStocks.length > 0 ? (
                      <CheckSquare size={14} className="text-emerald-600" />
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>
                <th className="p-3">Item Classification Name</th>
                <th className="p-3">Quantity Balance</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Assigned Facility Location</th>
                <th className="p-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((item) => {
                  const isChecked = selectedItemIds.includes(item.id);
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isChecked
                          ? 'bg-blue-50/50 hover:bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(item.id)}
                          className="text-gray-400 hover:text-blue-600 inline-flex items-center"
                        >
                          {isChecked ? (
                            <CheckSquare size={14} className="text-blue-600" />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-semibold text-gray-900 uppercase">
                        {item.item_name}
                      </td>

                      {/* QUANTITY FIELD: INTERACTIVE SWITCH */}
                      <td className="p-3 font-medium text-emerald-700">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editQty}
                            onChange={(e) => setEditQty(Number(e.target.value))}
                            className="border bg-white rounded px-2 py-0.5 text-xs font-bold w-20 outline-none focus:border-emerald-600"
                          />
                        ) : (
                          <span>{item.quantity}</span>
                        )}
                      </td>

                      <td className="p-3 text-gray-500">{item.unit}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] border font-medium">
                          {item.location}
                        </span>
                      </td>

                      {/* ACTION CONTROLS COLUMN */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => saveInlineEdit(item.id)}
                              className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 shadow-2xs"
                              title="Save quantity change"
                            >
                              <Save size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="bg-gray-200 text-gray-600 p-1 rounded hover:bg-gray-300"
                              title="Cancel changes"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startInlineEdit(item)}
                            className="text-slate-400 hover:text-blue-600 p-1 transition"
                            title="Modify individual line count"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-400 italic"
                  >
                    No warehouse logs found matching current configurations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
