'use client';

import React from 'react';
import { Database, MessageSquare, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-150 max-w-md w-full text-center space-y-5">
        
        {/* BRAND NEW ALL-CAPS BOLD TITLE ACCORDING TO YOUR SPECIFICATIONS */}
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-wide uppercase leading-tight">
            NEWTON BRITISH SCHOOL MURAIKH LABORATORY SYSTEM
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Designed by Mariam Selim • Workspace Gateway
          </p>
        </div>

        <p className="text-xs text-gray-500 font-medium">
          Select a workspace control portal to begin operational duties.
        </p>

        {/* NAVIGATION LAUNCH LINKS */}
        <div className="flex flex-col gap-3 pt-2">
          <Link 
            href="/inventory" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            <Database size={14} /> Go to Inventory Manager
          </Link>

          <Link 
            href="/request" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageSquare size={14} /> Go to Teacher Portal
          </Link>

          <Link 
            href="/dashboard" 
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            <ClipboardList size={14} /> Go to Tech Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
