import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown } from 'lucide-react';

interface Option {
  value: number | string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | string | undefined;
  onChange: (value: number | string | undefined) => void;
  name?: string;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  name,
  placeholder = 'Chọn...',
  error = false,
  disabled = false,
  allowClear = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const safeOptions = allowClear 
    ? [{ value: '', label: placeholder }, ...options]
    : options;

  const filteredOptions = safeOptions.filter(option =>
    (option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  let selectedOption = safeOptions.find(opt => opt.value === value);
  if (!selectedOption && !allowClear) {
      selectedOption = undefined;
  } else if (!selectedOption && allowClear) {
      selectedOption = safeOptions[0];
  }

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      
      // Calculate available space below and above
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      const dropdownHeight = 300; // estimated max height of dropdown
      
      // Decide whether to show above or below
      let top = rect.bottom + 4;
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        // Show above if not enough space below AND there is more space above
        top = rect.top - dropdownHeight - 4; // We'll let CSS max-height handle the exact sizing
      }
      
      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 99999, // Ensure it's on top of everything
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      // Add scroll and resize listeners to adjust position or close
      const handleScroll = (e: Event) => {
        // Only update if it's not the dropdown itself scrolling
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          updatePosition();
        }
      };
      
      window.addEventListener('resize', updatePosition, true);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition, true);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapperRef.current && !wrapperRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const dropdownElement = (
    <div 
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col"
    >
      <div className="p-2 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto py-1">
        {filteredOptions.length === 0 ? (
          <div className="p-3 text-sm text-slate-500 text-center">Không tìm thấy kết quả</div>
        ) : (
          filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors text-slate-700 flex items-center justify-between
                ${option.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50'}
              `}
              onClick={() => {
                if (option.value === '') {
                    onChange(undefined);
                } else {
                    onChange(option.value);
                }
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative w-full text-sm">
      <div
        className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between cursor-pointer transition-colors
          ${error ? 'border-rose-300 focus:border-rose-500 ring-rose-500/10' : 'border-slate-200 focus:border-blue-600 ring-blue-600/10'}
          ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white text-slate-700 hover:border-slate-300'}
        `}
        onClick={toggleDropdown}
      >
        <span className="truncate pr-4">
          {selectedOption && selectedOption.value !== '' ? <span className="font-medium text-slate-800">{selectedOption.label}</span> : <span className="text-slate-500">{placeholder}</span>}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && document.body && createPortal(dropdownElement, document.body)}
    </div>
  );
}
