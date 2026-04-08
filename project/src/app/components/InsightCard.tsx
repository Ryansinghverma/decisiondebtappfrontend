import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

interface InsightCardProps {
  title: string;
  description: string;
  type?: "positive" | "negative" | "neutral";
}

export function InsightCard({ title, description, type = "neutral" }: InsightCardProps) {
  const colors = {
    positive: "bg-green-50 border-green-200 text-green-900",
    negative: "bg-amber-50 border-amber-200 text-amber-900",
    neutral: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const icons = {
    positive: <TrendingUp className="w-5 h-5 text-green-600" />,
    negative: <TrendingDown className="w-5 h-5 text-amber-600" />,
    neutral: <AlertCircle className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className={`rounded-xl p-6 border ${colors[type]}`}>
      <div className="flex items-start gap-4">
        <div className="mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}
