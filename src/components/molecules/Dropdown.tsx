"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({ options, value, onChange, className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, { passive: true });
      window.addEventListener("resize", updateCoords, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", updateCoords);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-portal")
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-(--color-bg-surface)/40 border border-(--color-border-default) rounded-lg px-4 py-3 text-(--color-text-primary) text-sm font-semibold flex items-center justify-between gap-2 hover:border-(--color-accent-500)/50 hover:bg-(--color-bg-surface)/60 focus:outline-none focus:border-(--color-accent-500) transition-all cursor-pointer shadow-sm shadow-black/10"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 opacity-80">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <CaretDown
          size={14}
          weight="bold"
          className={`text-(--color-text-secondary) shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-(--color-accent-400)" : ""
          }`}
        />
      </button>

      {/* Floating Options Panel rendered via Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: coords.top + 8,
                left: coords.left,
                width: coords.width,
              }}
              className="z-[9999] bg-neutral-950/90 backdrop-blur-md border border-(--color-border-default) rounded-lg shadow-xl shadow-black/50 p-1 flex flex-col gap-0.5 dropdown-portal max-h-60 overflow-y-auto"
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-md text-left text-sm font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-(--color-accent-500)/10 text-(--color-accent-400) border border-(--color-accent-500)/20"
                        : "text-(--color-text-secondary) border border-transparent hover:text-(--color-text-primary) hover:bg-(--color-bg-surface)/50"
                    }`}
                  >
                    {option.icon && (
                      <span
                        className={`shrink-0 transition-colors ${
                          isSelected ? "text-(--color-accent-400)" : "text-(--color-text-secondary)"
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
