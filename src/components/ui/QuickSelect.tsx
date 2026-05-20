'use client';

interface QuickSelectProps {
  label: string;
  items: string[];
  onSelect: (item: string) => void;
}

export function QuickSelect({ label, items, onSelect }: QuickSelectProps) {
  return (
    <div className="mt-1.5">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
