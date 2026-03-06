import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

interface VisitorInsight {
    date: string;
    activeUsers: number;
}

interface VisitorChartProps {
    data: VisitorInsight[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-card p-3 shadow-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                        {payload[0].value?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">visitors</span>
                </div>
            </div>
        );
    }
    return null;
};

export function VisitorChart({ data }: VisitorChartProps) {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Transform API data to chart format
    const chartData = data.map(item => ({
        date: item.date,
        visitors: item.activeUsers,
    }));

    return (
        <div className={`transition-opacity duration-1000 ${isAnimated ? 'opacity-100' : 'opacity-0'} h-[300px] w-full`}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="hsl(var(--border))" 
                        strokeOpacity={0.5} 
                    />
                    <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }} />
                    <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorVisitors)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
