import { useState } from 'react';
import { PencilIcon } from './PencilIcon';
import { CheckIcon } from './CheckIcon';
import { XIcon } from './XIcon';

interface EditableNameProps {
  name: string;
  onSave: (newName: string) => Promise<void> | void;
  className?: string;
  textClassName?: string;
  inputClassName?: string;
  iconSize?: string;
  disabled?: boolean;
}

export function EditableName({
  name,
  onSave,
  className = '',
  textClassName = '',
  inputClassName = '',
  iconSize = 'w-5 h-5',
  disabled = false,
}: EditableNameProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (editName !== name) {
      setSaving(true);
      await onSave(editName);
      setSaving(false);
    }
    setEditing(false);
  };

  return (
    <span className={`inline-flex items-center min-w-0 ${className}`}>
      {editing ? (
        <span className="relative w-full max-w-xs" style={{ minWidth: 0, width: '100%', maxWidth: 340 }}>
          <input
            className={`border rounded px-2 py-1 text-base font-semibold w-full pr-14 ${inputClassName}`}
            value={editName}
            disabled={saving || disabled}
            onChange={e => setEditName(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={async e => {
              if (e.key === 'Enter') await handleSave();
              else if (e.key === 'Escape') setEditing(false);
            }}
            autoFocus
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 z-10">
            <button
              className="text-green-600 hover:text-green-800 p-1 rounded"
              title="Save"
              disabled={saving || disabled}
              onClick={async e => {
                e.stopPropagation();
                await handleSave();
              }}
            >
              <CheckIcon className={iconSize} />
            </button>
            <button
              className="text-red-500 hover:text-red-700 p-1 rounded"
              title="Cancel"
              disabled={saving || disabled}
              onClick={e => {
                e.stopPropagation();
                setEditName(name);
                setEditing(false);
              }}
            >
              <XIcon className={iconSize} />
            </button>
          </span>
        </span>
      ) : (
        <>
          <span className={`truncate ${textClassName}`} title={name}>{name}</span>
          <button
            className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded"
            title="Rename"
            disabled={disabled}
            onClick={e => {
              e.stopPropagation();
              setEditName(name);
              setEditing(true);
            }}
          >
            <PencilIcon className={iconSize} />
          </button>
        </>
      )}
    </span>
  );
}
