import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  changeText?: string;
  changeValue?: number;
  isPositiveChange?: boolean;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  changeText = "",
  changeValue,
  isPositiveChange = true
}: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-4">
            <h3 className="font-normal text-gray-500 text-sm">{title}</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-[#0A2463]">{value}</span>
              {changeText && (
                <span className={`ml-2 text-xs ${isPositiveChange ? 'text-green-500' : 'text-yellow-500'} font-medium`}>
                  {changeText}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
