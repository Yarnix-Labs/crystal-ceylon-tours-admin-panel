import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts";

interface Country {
    country: string;
    activeUsers: number;
}

interface CountryChartProps {
    data: Country[];
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

export function CountryChart({ data }: CountryChartProps) {
    // Transform API data to chart format and limit to top 5
    const chartData = data
        .map(item => ({
            country: item.country,
            visitors: item.activeUsers,
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5);

    if (chartData.length === 0) {
        return (
            <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full pl-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        horizontal={true} 
                        vertical={false}
                        stroke="hsl(var(--border))" 
                        strokeOpacity={0.5} 
                    />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="country" 
                        type="category" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        width={60}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    />
                    <Bar 
                        dataKey="visitors" 
                        fill="#8b5cf6" 
                        layout="vertical"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
