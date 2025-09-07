import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center border border-border rounded-lg p-1 bg-secondary/30">
      <Button
        variant={view === 'grid' ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange('grid')}
        className="h-8 px-2"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-8 px-2"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;