'use client';

import { useState, useRef, useEffect } from 'react';
import { COMMON_DIAGNOSES, DiagnosisTerm } from '@/lib/medical-terms';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  codeValue: string;
  onChange: (name: string, code: string) => void;
  required?: boolean;
}

export function DiagnosisAutocomplete({ value, codeValue, onChange, required }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? COMMON_DIAGNOSES.filter(
        (d) => d.name.includes(query) || d.code.toLowerCase().includes(query.toLowerCase()) || d.category.includes(query)
      ).slice(0, 8)
    : [];

  const select = (d: DiagnosisTerm) => {
    setQuery(d.name);
    onChange(d.name, d.code);
    setOpen(false);
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative" ref={ref}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          진단명 {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            required={required}
            placeholder="진단명 검색 또는 직접 입력"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value, e.target.value !== value ? '' : codeValue);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={`${inputCls} pl-8`}
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filtered.map((d) => (
              <button
                key={d.code}
                type="button"
                onClick={() => select(d)}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{d.name}</span>
                  <span className="text-xs text-blue-600 font-mono">{d.code}</span>
                </div>
                <span className="text-xs text-gray-400">{d.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">진단 코드 (ICD-10)</label>
        <input
          type="text"
          placeholder="자동 입력 또는 직접 입력"
          value={codeValue}
          onChange={(e) => onChange(query, e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}
