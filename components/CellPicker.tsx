"use client";

interface Props {
  values: string[];
  currentValue: string | undefined;
  onCommit: (value: string) => void;
}

export function CellPicker({ values, currentValue, onCommit }: Props) {
  return (
    <div
      className="border border-border rounded-lg px-4 py-3 flex flex-wrap gap-x-2 gap-y-1 shadow-lg"
      style={{ backgroundColor: "var(--bg-elev)" }}
    >
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onCommit(v)}
          className="px-2 py-1 text-sm rounded flex items-center gap-1 transition-colors hover:bg-bg-elev-2"
          style={{ color: v === currentValue ? "var(--accent-green)" : "var(--fg)" }}
        >
          {v === currentValue && (
            <span style={{ color: "var(--accent-green)" }}>●</span>
          )}
          {v}
        </button>
      ))}
    </div>
  );
}
