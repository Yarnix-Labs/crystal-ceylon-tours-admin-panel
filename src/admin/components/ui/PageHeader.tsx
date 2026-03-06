
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
    heading: string;
    description?: string;
    className?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
        disabled?: boolean;
    };
    children?: ReactNode;
}

export function AdminPageHeader({
    heading,
    description,
    className,
    action,
    children,
}: AdminPageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h2>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {children}
                {action && (
                    <Button 
                        onClick={action.onClick} 
                        disabled={action.disabled}
                        className="h-10 px-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                    >
                        {action.icon || <Plus className="mr-2 h-4 w-4" />}
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
