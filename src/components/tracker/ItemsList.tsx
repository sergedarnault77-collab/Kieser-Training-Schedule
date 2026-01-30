import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { TrackedItem, Preset } from "../../types/tracker";

interface ItemsListProps {
  items: TrackedItem[];
  presets: Preset[];
  onDelete: (id: string) => void;
  itemName: string;
}

export function ItemsList({
  items,
  presets,
  onDelete,
  itemName,
}: ItemsListProps) {
  const sortedItems = [...items].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const getItemName = (item: TrackedItem) => {
    if (item.presetId) {
      const preset = presets.find((p) => p.id === item.presetId);
      return preset?.name || "Unknown";
    }
    return item.customName || "Custom";
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No entries yet. Start tracking by logging your first {itemName.toLowerCase()}!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getItemName(item)}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.amount} {item.unit}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(item.timestamp, "MMM d, yyyy 'at' h:mm a")}
                </div>
                {item.notes && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.notes}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
