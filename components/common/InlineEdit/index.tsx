"use client";

import { useEffect, useRef, useState } from "react";

type InlineEditProps = {
  value: string;
  onSave: (value: string) => Promise<void>;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export default function InlineEdit({
  value,
  onSave,
  required = false,
  placeholder,
  className = "",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (required && !trimmed) {
      setDraft(value);
      setIsEditing(false);
      return;
    }
    if (trimmed === value.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(trimmed);
    } catch {
      setDraft(value);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`bg-transparent outline-none border-b border-current w-full ${className}`}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={startEditing}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") startEditing();
      }}
      title="Clique para editar"
      className={`cursor-text hover:underline decoration-dashed underline-offset-2 ${className}`}
    >
      {value || <span className="opacity-40 font-normal">{placeholder}</span>}
    </span>
  );
}
