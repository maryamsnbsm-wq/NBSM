'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  ShieldCheck,
  ClipboardList,
  Trash2,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const myProfile = {
    name: 'Mariam Selim',
    title: 'Laboratory Logistics Coordinator',
  };
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    const syncLocal = () => {
      const saved = JSON.parse(
        localStorage.getItem('all_lab_requests') || '[]'
      );
      setAllRequests(saved);
      if (saved.length > 0 && !selectedRequest) {
        setSelectedRequest(saved[0]);
      }
    };
    syncLocal();
    window.addEventListener('storage', syncLocal);
    const interval = setInterval(syncLocal, 1000);
    return () => {
      window.removeEventListener('storage', syncLocal);
      clearInterval(interval);
    };
  }, [selectedRequest]);

  const updateStatus = (id: number, nextStatus: string) => {
    const updated = allRequests.map((req) =>
      req.id === id ? { ...req, status: nextStatus } : req
    );
    setAllRequests(updated);
    localStorage.setItem('all_lab_requests', JSON.stringify(updated));
    localStorage.setItem('lab_order_status', nextStatus);
    if (selectedRequest?.id === id) {
      setSelectedRequest({ ...selectedRequest, status: nextStatus });
    }
  };

  const deleteRequest = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = allRequests.filter((req) => req.id !== id);
    setAllRequests(updated);
    localStorage.setItem('all_lab_requests', JSON.stringify(updated));
    if (selectedRequest?.id === id) setSelectedRequest(updated[0] || null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-gray-800">
      {/* BRANDED HEADER PANEL */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-blue-500" />
          <div>
            <h1 className="text-xs md:text-sm font-black tracking-wide uppercase text-white">
              NEWTON BRITISH SCHOOL MURAIKH LABORATORY SYSTEM
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
              Designed by Mariam Selim • Master Control Room
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs bg-slate-700 px-3 py-1.5 rounded-lg text-white hover:bg-slate-600 flex items-center gap-1"
        >
          <Home size={12} /> Main Hub
        </Link>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* REQUESTS LIST SIDEBAR */}
        <div className="w-2/5 p-4 overflow-y-auto border-r bg-white space-y-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Incoming Operational Requests
          </h2>
          {allRequests.length > 0 ? (
            allRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-start ${
                  selectedRequest?.id === req.id
                    ? 'border-blue-500 bg-blue-50/40'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900">
                    {req.experiment_title}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    By: {req.teacher_name} ({req.request_type})
                  </p>
                  <div className="flex gap-2 text-[9px] text-blue-700 font-medium">
                    <span className="bg-slate-100 px-1 rounded">
                      {req.assigned_lab}
                    </span>
                    <span className="bg-slate-100 px-1 rounded">
                      {req.class_period?.split(' ')[0]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      req.status === 'Requested'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {req.status}
                  </span>
                  <button
                    onClick={(e) => deleteRequest(req.id, e)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-xl">
              No scheduling entries loaded.
            </div>
          )}
        </div>

        {/* DETAILS DESK WORKSPACE */}
        <div className="w-3/5 bg-gray-50 flex flex-col justify-between overflow-hidden p-4">
          {selectedRequest ? (
            <div className="bg-white p-5 rounded-xl border shadow-xs space-y-4 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-base font-black text-gray-900">
                    {selectedRequest.experiment_title}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Instructor Log: {selectedRequest.teacher_name} •{' '}
                    <span className="text-indigo-600 font-bold">
                      {selectedRequest.request_type}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() =>
                      updateStatus(selectedRequest.id, 'Preparing')
                    }
                    className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-blue-700"
                  >
                    ⚙️ Prep
                  </button>
                  <button
                    onClick={() => updateStatus(selectedRequest.id, 'Ready')}
                    className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-emerald-700"
                  >
                    ✅ Ready
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 border p-2 rounded-lg flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      Date
                    </p>
                    <p className="font-semibold">
                      {selectedRequest.needed_date}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 border p-2 rounded-lg flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      Lab Space
                    </p>
                    <p className="font-semibold">
                      {selectedRequest.assigned_lab}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 border p-2 rounded-lg flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      Period Slot
                    </p>
                    <p className="font-semibold">
                      {selectedRequest.class_period?.split(' ')[0]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-lg text-xs leading-relaxed">
                <p className="font-bold text-blue-900 mb-1">
                  Unpacked Material Specifications:
                </p>
                <p className="text-gray-700">{selectedRequest.notes}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border border-dashed rounded-xl bg-white">
              <ClipboardList size={32} className="mb-1 text-gray-300" />
              <p className="text-xs">
                Select a checklist requisition entry to open scheduling
                specifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
