import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Report, Preset } from "../../types/tracker";
import { format } from "date-fns";

interface ReportsCardProps {
  generateReport: (
    period: "daily" | "weekly" | "monthly",
    endDate?: Date
  ) => Report;
  presets: Preset[];
}

export function ReportsCard({ generateReport, presets }: ReportsCardProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "weekly"
  );
  const [report, setReport] = useState<Report | null>(null);

  const handleGenerateReport = () => {
    const newReport = generateReport(period);
    setReport(newReport);
  };

  const getChartData = () => {
    if (!report) return [];

    return Object.entries(report.itemsByPreset).map(([presetId, amount]) => {
      const preset = presets.find((p) => p.id === presetId);
      return {
        name: preset?.name || presetId,
        amount: amount,
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports & Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={period}
            onValueChange={(value: "daily" | "weekly" | "monthly") =>
              setPeriod(value)
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>

        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">
                  {report.totalAmount.toFixed(1)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Avg per Day
                </div>
                <div className="text-2xl font-bold">
                  {report.averagePerDay.toFixed(1)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Peak Amount</div>
                <div className="text-2xl font-bold">
                  {report.peakAmount.toFixed(1)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Peak Date</div>
                <div className="text-lg font-bold">
                  {format(report.peakDate, "MMM d")}
                </div>
              </div>
            </div>

            {getChartData().length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Breakdown by Type</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
