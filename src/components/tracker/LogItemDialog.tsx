import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import type { Preset, TrackedItem } from "../../types/tracker";

interface LogItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: Preset[];
  onSubmit: (item: Omit<TrackedItem, "id">) => void;
  itemName: string;
  defaultUnit: string;
}

export function LogItemDialog({
  open,
  onOpenChange,
  presets,
  onSubmit,
  itemName,
  defaultUnit,
}: LogItemDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState(defaultUnit);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const preset = presets.find((p) => p.id === selectedPreset);
    const itemAmount = amount ? parseFloat(amount) : preset?.defaultAmount || 0;

    onSubmit({
      presetId: selectedPreset || undefined,
      customName: selectedPreset ? undefined : customName,
      amount: itemAmount,
      unit: preset?.unit || unit,
      timestamp: new Date(),
      notes: notes || undefined,
    });

    // Reset form
    setSelectedPreset("");
    setCustomName("");
    setAmount("");
    setUnit(defaultUnit);
    setNotes("");
    onOpenChange(false);
  };

  const selectedPresetData = presets.find((p) => p.id === selectedPreset);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log {itemName}</DialogTitle>
          <DialogDescription>
            Add a new entry to your tracking log
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="preset">Select Preset</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger id="preset">
                <SelectValue placeholder="Choose a preset or create custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom {itemName}</SelectItem>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                    {preset.category && ` (${preset.category})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPreset === "custom" && (
            <div>
              <Label htmlFor="customName">Custom Name</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Enter ${itemName.toLowerCase()} name`}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="amount">
              Amount
              {selectedPresetData &&
                ` (default: ${selectedPresetData.defaultAmount} ${selectedPresetData.unit})`}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={
                selectedPresetData
                  ? selectedPresetData.defaultAmount.toString()
                  : "Enter amount"
              }
            />
          </div>

          {!selectedPresetData && selectedPreset === "custom" && (
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., mg, ml, servings"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Log {itemName}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
