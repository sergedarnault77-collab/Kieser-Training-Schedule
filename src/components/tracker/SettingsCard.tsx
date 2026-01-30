import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Settings as SettingsIcon, Download, Upload } from "lucide-react";
import type { Settings, DailyLimit } from "../../types/tracker";

interface SettingsCardProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
  defaultUnit: string;
}

export function SettingsCard({
  settings,
  onUpdateSettings,
  onExport,
  onImport,
  defaultUnit,
}: SettingsCardProps) {
  const [limitEnabled, setLimitEnabled] = useState(!!settings.dailyLimit);
  const [limitAmount, setLimitAmount] = useState(
    settings.dailyLimit?.maxAmount?.toString() || ""
  );
  const [warningThreshold, setWarningThreshold] = useState(
    settings.dailyLimit?.warningThreshold?.toString() || "80"
  );

  const handleSaveLimit = () => {
    if (limitEnabled && limitAmount) {
      const newLimit: DailyLimit = {
        maxAmount: parseFloat(limitAmount),
        unit: settings.dailyLimit?.unit || defaultUnit,
        warningThreshold: parseFloat(warningThreshold),
      };
      onUpdateSettings({
        ...settings,
        dailyLimit: newLimit,
      });
    } else {
      onUpdateSettings({
        ...settings,
        dailyLimit: undefined,
      });
    }
  };

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracker-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const success = onImport(data);
        if (success) {
          alert("Data imported successfully!");
        } else {
          alert("Failed to import data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="limit-enabled">Enable Daily Limit</Label>
            <Switch
              id="limit-enabled"
              checked={limitEnabled}
              onCheckedChange={setLimitEnabled}
            />
          </div>

          {limitEnabled && (
            <>
              <div>
                <Label htmlFor="limit-amount">Daily Limit ({defaultUnit})</Label>
                <Input
                  id="limit-amount"
                  type="number"
                  step="0.1"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="Enter daily limit"
                />
              </div>

              <div>
                <Label htmlFor="warning-threshold">
                  Warning Threshold (%)
                </Label>
                <Input
                  id="warning-threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(e.target.value)}
                  placeholder="80"
                />
              </div>
            </>
          )}

          <Button onClick={handleSaveLimit} className="w-full">
            Save Limit Settings
          </Button>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Data Management</h4>

          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>

          <div>
            <Label htmlFor="import-file">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </span>
              </Button>
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Notifications</Label>
            <Switch
              id="notifications"
              checked={settings.notifications.enabled}
              onCheckedChange={(checked) =>
                onUpdateSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    enabled: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
