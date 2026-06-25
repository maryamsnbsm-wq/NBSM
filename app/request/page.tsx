'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Home,
  MessageSquare,
  Package,
  Clock,
  Plus,
  Minus,
  FileText,
  Calendar,
  User,
  Search,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface MaterialItem {
  name: string;
  quantity: number;
  unit: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  location: string;
}

export default function RequestPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'chat'>('create');
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [orderStatus, setOrderStatus] = useState('Requested');

  const [templateSearch, setTemplateSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  // Logistics Form Fields
  const [teacherName, setTeacherName] = useState('');
  const [experimentTitle, setExperimentTitle] = useState('');
  const [neededDate, setNeededDate] = useState('');
  const [selectedLab, setSelectedLab] = useState('Biology Lab 1');
  const [selectedPeriod, setSelectedPeriod] = useState(
    'Period 1 (7:10 - 8:00)'
  );
  const [requestType, setRequestType] = useState('Student Practical');

  // Dynamic Requisition States
  const [materialsBasket, setMaterialsBasket] = useState<MaterialItem[]>([]);
  const [stagingQuantities, setStagingQuantities] = useState<{
    [key: string]: number;
  }>({});

  // Live Inventory State
  const [generalInventory, setGeneralInventory] = useState<InventoryItem[]>([]);
  const [scheduleConflict, setScheduleConflict] = useState<string | null>(null);

  const classPeriods = [
    'Period 1 (7:10 - 8:00)',
    'Period 2 (8:00 - 8:50)',
    'Period 3 (8:50 - 9:40)',
    'Period 4 (10:00 - 10:50)',
    'Period 5 (10:50 - 11:40)',
    'Period 6 (12:00 - 12:50)',
    'Period 7 (12:50 - 13:40)',
  ];

  // MATCHED TEMPLATES DIRECTLY LINKED TO YOUR REAL NEWTON BRITISH SCHOOL STOCK LIST HEADERS
  const curriculumTemplates = [
    {
      id: 'ks3-body',
      stage: 'KS3',
      title: '🔬 Human Body Organ Systems (Biology)',
      items: [
        { name: 'EYE MODEL LARGE', quantity: 2, unit: 'pcs' },
        { name: 'KIDNEY MODEL', quantity: 2, unit: 'pcs' },
        { name: 'PUMPING HEART', quantity: 1, unit: 'SETS' },
        { name: 'HUMAN SKELETON', quantity: 1, unit: 'pcs' },
      ],
    },
    {
      id: 'ks3-circulation',
      stage: 'KS3',
      title: '🩺 Circulation & Heart Rate Monitoring',
      items: [
        { name: 'HEART  MODEL LARGE', quantity: 2, unit: 'pcs' },
        { name: 'ARTERY & VEIN MODEL', quantity: 2, unit: 'pcs' },
        { name: 'SPHYGMOMANOMETER', quantity: 2, unit: 'pcs' },
      ],
    },
    {
      id: 'ks3-space',
      stage: 'KS3',
      title: '🪐 Solar Systems & Optics Analysis',
      items: [
        { name: 'solar system model', quantity: 2, unit: 'items' },
        { name: 'LASER POINTER', quantity: 5, unit: 'pcs' },
        { name: 'CONCAVE LENS', quantity: 10, unit: 'pcs' },
        { name: 'DOUBLE CONVEX LENS', quantity: 10, unit: 'pcs' },
      ],
    },
    {
      id: 'ks4-physics',
      stage: 'KS4',
      title: '⚡ GCSE Wave Properties & Springs',
      items: [
        { name: 'SLINKY SPRING COIL 7.5 CM', quantity: 5, unit: 'pcs' },
        { name: 'SPRINGS 10MM', quantity: 15, unit: 'pcs' },
        { name: 'LENSE HOLDER', quantity: 10, unit: 'pcs' },
      ],
    },
  ];

  useEffect(() => {
    const syncInventoryWithWarehouse = () => {
      const savedMasterStock = localStorage.getItem('master_lab_inventory');
      if (savedMasterStock) {
        setGeneralInventory(JSON.parse(savedMasterStock));
      }
    };
    syncInventoryWithWarehouse();
    window.addEventListener('storage', syncInventoryWithWarehouse);
    const poller = setInterval(syncInventoryWithWarehouse, 1500);
    return () => {
      window.removeEventListener('storage', syncInventoryWithWarehouse);
      clearInterval(poller);
    };
  }, []);

  const filteredInventory = generalInventory.filter(
    (item) =>
      item.item_name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.location.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const filteredTemplates = curriculumTemplates.filter((tmpl) =>
    tmpl.title.toLowerCase().includes(templateSearch.toLowerCase())
  );

  useEffect(() => {
    if (!neededDate) return;
    const existingRequests = JSON.parse(
      localStorage.getItem('all_lab_requests') || '[]'
    );
    const isConflict = existingRequests.find(
      (req: any) =>
        req.needed_date === neededDate &&
        req.assigned_lab === selectedLab &&
        req.class_period === selectedPeriod
    );
    if (isConflict) {
      setScheduleConflict(
        `⚠️ CLASH: ${selectedLab} is already reserved for ${
          selectedPeriod.split(' ')[0]
        } on this date!`
      );
    } else {
      setScheduleConflict(null);
    }
  }, [neededDate, selectedLab, selectedPeriod]);

  const loadTemplateIntoBasket = (
    title: string,
    templateItems: MaterialItem[]
  ) => {
    setExperimentTitle(title);
    setMaterialsBasket(templateItems);
  };

  const adjustStagingQty = (itemName: string, amount: number) => {
    setStagingQuantities((prev) => ({
      ...prev,
      [itemName]: Math.max(0, (prev[itemName] || 0) + amount),
    }));
  };

  const addSelectedToMainBasket = () => {
    const itemsToAdd: MaterialItem[] = [];
    Object.keys(stagingQuantities).forEach((name) => {
      if (stagingQuantities[name] > 0) {
        const invItem = generalInventory.find((i) => i.item_name === name);
        itemsToAdd.push({
          name,
          quantity: stagingQuantities[name],
          unit: invItem ? invItem.unit : 'pcs',
        });
      }
    });
    setMaterialsBasket((prev) => {
      let current = [...prev];
      itemsToAdd.forEach((newItem) => {
        const idx = current.findIndex((i) => i.name === newItem.name);
        if (idx > -1) current[idx].quantity += newItem.quantity;
        else current.push(newItem);
      });
      return current;
    });
    setStagingQuantities({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleConflict) return;
    const formattedNotes = materialsBasket
      .map((item) => `${item.quantity}x ${item.name} (${item.unit})`)
      .join(', ');
    const newRequest = {
      id: Date.now(),
      teacher_name: teacherName,
      experiment_title: experimentTitle,
      needed_date: neededDate,
      assigned_lab: selectedLab,
      class_period: selectedPeriod,
      request_type: requestType,
      notes: formattedNotes || 'No materials requested.',
      status: 'Requested',
    };
    const currentRequests = JSON.parse(
      localStorage.getItem('all_lab_requests') || '[]'
    );
    localStorage.setItem(
      'all_lab_requests',
      JSON.stringify([newRequest, ...currentRequests])
    );
    setActiveTab('chat');
  };

  const stagedCount = Object.values(stagingQuantities).filter(
    (q) => q > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex flex-col max-w-7xl mx-auto text-gray-800">
      {/* HEADER */}
      <div className="w-full mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-xs border gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0 shadow-xs"
            >
              🏠 Main Hub
            </Link>
            <h1 className="font-black text-slate-950 text-sm md:text-base tracking-wide ml-1 uppercase">
              NEWTON BRITISH SCHOOL MURAIKH LABORATORY SYSTEM
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 font-bold tracking-wider pl-1 uppercase">
            Designed by Mariam Selim • Head Coordinator Desk
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            📝 Build Order
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            💬 Status & Chat
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="w-full grid grid-cols-12 gap-4">
          {/* PROFILE FORM */}
          <form
            onSubmit={handleFormSubmit}
            className="col-span-5 bg-white p-4 rounded-2xl shadow-md border space-y-3"
          >
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1.5 border-b flex items-center gap-1.5">
              <FileText size={14} /> Parameters
            </h2>
            {scheduleConflict && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg text-xs font-semibold animate-pulse">
                {scheduleConflict}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Instructor Name
                </label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g., Dr. Allison"
                  className="w-full border p-1.5 rounded-lg text-xs outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  value={experimentTitle}
                  onChange={(e) => setExperimentTitle(e.target.value)}
                  placeholder="e.g., Osmosis Practical"
                  className="w-full border p-1.5 rounded-lg text-xs outline-none bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Laboratory Space
                </label>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full border p-1.5 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="Biology Lab 1">Biology Lab 1</option>
                  <option value="Chemistry Lab 2">Chemistry Lab 2</option>
                  <option value="Physics Lab 3">Physics Lab 3</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Execution Requirement
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full border p-1.5 rounded-lg text-xs bg-white outline-none"
                >
                  <option value="Student Practical">
                    Student Practical Activity
                  </option>
                  <option value="Teacher Demonstration">
                    Teacher Demonstration
                  </option>
                  <option value="Pre-Lesson Practice Session">
                    Pre-Lesson Practice
                  </option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Lesson Date
                </label>
                <input
                  type="date"
                  required
                  value={neededDate}
                  onChange={(e) => setNeededDate(e.target.value)}
                  className="w-full border p-1.5 rounded-lg text-xs outline-none bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-0.5 block">
                  Timetable Period Slot
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full border p-1.5 rounded-lg text-xs bg-white outline-none"
                >
                  {classPeriods.map((per, i) => (
                    <option key={i} value={per}>
                      {per}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 mb-1 block">
                Materials Checklist Basket
              </label>
              <div className="border rounded-xl bg-slate-50 p-2 min-h-[110px] max-h-[110px] overflow-y-auto space-y-1">
                {materialsBasket.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white p-1.5 rounded-lg border text-[11px]"
                  >
                    <span className="font-semibold text-gray-700 truncate w-32">
                      {item.quantity}x {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setMaterialsBasket(
                          materialsBasket.filter((i) => i.name !== item.name)
                        )
                      }
                      className="text-gray-300 hover:text-red-500 font-black px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!!scheduleConflict}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 rounded-xl text-xs transition"
            >
              🚀 Submit Allocation Request
            </button>
          </form>

          {/* TEMPLATE CONTAINER */}
          <div className="col-span-4 bg-white p-4 rounded-2xl shadow-md border flex flex-col h-[465px]">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles size={14} className="text-indigo-500" /> Ready
              Experiment Templates
            </h2>
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-2.5 top-2.5 text-gray-400"
              />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-0.5">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => loadTemplateIntoBasket(tmpl.title, tmpl.items)}
                  className="p-2 rounded-xl border cursor-pointer text-xs flex justify-between items-center bg-slate-50 hover:bg-indigo-50"
                >
                  <div className="truncate">
                    <p className="font-semibold text-gray-800">{tmpl.title}</p>
                  </div>
                  <span className="text-[9px] bg-white border text-gray-400 px-1.5 py-0.5 rounded shrink-0">
                    Load
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GENERAL WAREHOUSE STOCK PICKER */}
          <div className="col-span-3 bg-white p-4 rounded-2xl shadow-md border flex flex-col h-[465px] justify-between">
            <div className="flex flex-col overflow-hidden flex-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Package size={14} className="text-emerald-500" /> General Stock
              </h3>
              <div className="relative my-1">
                <Search
                  size={13}
                  className="absolute left-2.5 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Filter catalog by name..."
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                />
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto pr-0.5">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-1.5 border rounded-lg flex justify-between items-center text-[11px] bg-slate-50 ${
                        stagingQuantities[item.item_name] > 0
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : ''
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="font-semibold text-gray-700 block truncate uppercase">
                          {item.item_name}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">
                          Stock: {item.quantity} {item.unit} ({item.location})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white border rounded p-0.5 shrink-0 shadow-3xs">
                        <button
                          type="button"
                          onClick={() => adjustStagingQty(item.item_name, -1)}
                          className="text-gray-400 p-0.5"
                        >
                          <Minus size={6} />
                        </button>
                        <span className="w-3 text-center font-bold text-[9px]">
                          {stagingQuantities[item.item_name] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustStagingQty(item.item_name, 1)}
                          className="text-gray-400 p-0.5"
                        >
                          <Plus size={6} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-[10px] text-gray-400 italic">
                    No warehouse logs match your query.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={addSelectedToMainBasket}
              disabled={stagedCount === 0}
              className="w-full bg-emerald-600 text-white font-bold py-1.5 rounded-xl text-xs mt-2 transition disabled:opacity-40 shadow-xs"
            >
              Add Selected Items
            </button>
          </div>
        </div>
      ) : (
        /* TRACKING RADAR */
        <div className="w-full flex gap-4">
          <div className="w-1/3 bg-white p-4 rounded-2xl shadow-md border space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Live Progress Radar
            </h3>
            <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-gray-900 truncate w-36">
                  {experimentTitle || 'No Request Loaded'}
                </h4>
                <p className="text-[9px] text-gray-400">{selectedLab}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                {orderStatus}
              </span>
            </div>
          </div>
          <div className="w-2/3 bg-white rounded-2xl shadow-md border flex flex-col h-[400px] overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="p-2 bg-white border rounded-xl text-xs max-w-[70%]"
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
