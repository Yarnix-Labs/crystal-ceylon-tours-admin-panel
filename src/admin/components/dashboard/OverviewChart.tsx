
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts';
import { useEffect, useState } from 'react';

const data = [
    { name: 'Jan', total: 1200 },
    { name: 'Feb', total: 2100 },
    { name: 'Mar', total: 800 },
    { name: 'Apr', total: 1600 },
    { name: 'May', total: 900 },
    { name: 'Jun', total: 1700 },
    { name: 'Jul', total: 2400 },
    { name: 'Aug', total: 2200 },
    { name: 'Sep', total: 1900 },
    { name: 'Oct', total: 2500 },
    { name: 'Nov', total: 2800 },
    { name: 'Dec', total: 3200 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-card p-3 shadow-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold text-primary">
                    {payload[0].value?.toLocaleString()} visitors
                </p>
            </div>
        );
    }
    return null;
};

export function OverviewChart() {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`transition-opacity duration-1000 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
            <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(184, 66%, 44%)" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="hsl(184, 66%, 44%)" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="hsl(184, 66%, 44%)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                        dy={10}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
                        dx={-10}
                    />
                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(184, 66%, 44%)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorTeal)"
                        animationDuration={1500}
                        animationBegin={200}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
