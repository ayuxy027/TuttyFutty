import { PenLine, X } from "lucide-react";

interface Cell {
  id: string;
  type: string;
  content: string;
}

interface CellNoteProps {
  cell: Cell;
  onChange: (content: string) => void;
  onRemove: () => void;
}

const CellNote = ({ cell, onChange, onRemove }: CellNoteProps) => {
  return (
    <div className="rounded-lg border border-cell-border bg-cell p-grid-3">
      <div className="mb-grid-2 flex items-center justify-between">
        <div className="flex items-center gap-grid">
          <PenLine size={12} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Note
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-primary"
        >
          <X size={12} />
        </button>
      </div>
      <textarea
        value={cell.content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your notes here..."
        className="min-h-[80px] w-full resize-none bg-transparent font-body text-xs leading-[20px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
};

export default CellNote;
