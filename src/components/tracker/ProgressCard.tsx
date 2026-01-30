import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import type { DailyLimit } from "../../types/tracker";

interface ProgressCardProps {
  currentAmount: number;
  limit?: DailyLimit;
  itemNamePlural: string;
}

export function ProgressCard({
  currentAmount,
  limit,
  itemNamePlural,
}: ProgressCardProps) {
  if (!limit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {currentAmount.toFixed(1)} units
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            No daily limit set
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentage = (currentAmount / limit.maxAmount) * 100;
  const warningThreshold = limit.warningThreshold || 80;
  const isNearLimit = percentage >= warningThreshold;
  const isOverLimit = percentage >= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline">
          <div className="text-3xl font-bold">
            {currentAmount.toFixed(1)}
            <span className="text-lg text-muted-foreground ml-1">
              / {limit.maxAmount} {limit.unit}
            </span>
          </div>
          <div className="text-sm font-medium">{percentage.toFixed(0)}%</div>
        </div>

        <Progress value={Math.min(percentage, 100)} />

        {isOverLimit && (
          <p className="text-sm text-destructive font-medium">
            Over daily limit!
          </p>
        )}
        {isNearLimit && !isOverLimit && (
          <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
            Approaching daily limit
          </p>
        )}
        {!isNearLimit && (
          <p className="text-sm text-muted-foreground">
            {(limit.maxAmount - currentAmount).toFixed(1)} {limit.unit}{" "}
            remaining
          </p>
        )}
      </CardContent>
    </Card>
  );
}
