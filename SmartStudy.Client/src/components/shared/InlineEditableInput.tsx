import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";

interface InlineEditableInputProps {
  value: string | number | null | undefined;
  onSave: (nextValue: string) => Promise<void> | void;
  type?: "text" | "number";
  step?: string;
  disabled?: boolean;
  emptyDisplay?: string;
  inputClassName?: string;
  displayClassName?: string;
  saveOnBlur?: boolean;
}

const toStringValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export default function InlineEditableInput({
  value,
  onSave,
  type = "text",
  step,
  disabled = false,
  emptyDisplay = "--",
  inputClassName,
  displayClassName,
  saveOnBlur = true,
}: InlineEditableInputProps) {
  const persistedValue = useMemo(() => toStringValue(value), [value]);

  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(persistedValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(persistedValue);
    }
  }, [isEditing, persistedValue]);

  const cancelEdit = () => {
    setDraftValue(persistedValue);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (isSubmitting) {
      return;
    }

    if (draftValue === persistedValue) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(draftValue);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsEditing(true)}
        className={displayClassName}
      >
        {persistedValue || emptyDisplay}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      type={type}
      step={step}
      value={draftValue}
      disabled={disabled || isSubmitting}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={() => {
        if (saveOnBlur) {
          void saveEdit();
          return;
        }

        cancelEdit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void saveEdit();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancelEdit();
        }
      }}
      className={inputClassName}
    />
  );
}
