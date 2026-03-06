import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis } from "recharts";

interface WeeklyBooking {
    day: string;
    count: number;
}

interface InquiryChartProps {
    data?: WeeklyBooking[];
}

const defaultData = [
    { name: "Mon", inquiries: 0 },
    { name: "Tue", inquiries: 0 },
    { name: "Wed", inquiries: 0 },
    { name: "Thu", inquiries: 0 },
    { name: "Fri", inquiries: 0 },
    { name: "Sat", inquiries: 0 },
    { name: "Sun", inquiries: 0 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-card p-3 shadow-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                        {payload[0].value}
                    </span>
                    <span className="text-xs text-muted-foreground">inquiries</span>
                </div>
            </div>
        );
    }
    return null;
};

export function InquiryChart({ data }: InquiryChartProps) {
    const chartData = data && data.length > 0
        ? data.map(item => ({ name: item.day, inquiries: item.count }))
        : defaultData;

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="hsl(var(--border))" 
                        strokeOpacity={0.5} 
                    />
                    <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    />
                    <Bar 
                        dataKey="inquiries" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
