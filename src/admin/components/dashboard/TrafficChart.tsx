import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";

interface TrafficSource {
    source: string;
    activeUsers: number;
}

interface TrafficChartProps {
    data: TrafficSource[];
}

const colors = [
    "hsl(var(--primary))",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const total = payload[0].payload.total || 0;
        const percentage = total > 0 ? (((payload[0].value as number) / total) * 100).toFixed(1) : "0";
        return (
            <div className="rounded-lg border bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                    <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: payload[0].payload.color }}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                        {payload[0].name}
                    </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                        {payload[0].value?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">users ({percentage}%)</span>
                </div>
            </div>
        );
    }
    return null;
};

export function TrafficChart({ data }: TrafficChartProps) {
    // Calculate total for percentage calculation
    const total = data.reduce((sum, item) => sum + item.activeUsers, 0);

    // Transform API data to chart format with colors and percentages
    const chartData = data.map((item, index) => ({
        name: item.source,
        value: item.activeUsers,
        color: colors[index % colors.length],
        total,
    }));

    if (chartData.length === 0 || total === 0) {
        return (
            <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-4 flex-wrap">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
