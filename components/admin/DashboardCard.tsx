import React from 'react';
import { Card } from '../common/Card';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, change }) => {
    return (
        <Card className="flex items-center p-4">
            <div className="p-3 rounded-full bg-brand-primary/20 text-brand-primary">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-text-primary/80">{title}</p>
                <p className="text-2xl font-semibold text-text-primary">{value}</p>
                {change && <p className="text-xs text-text-primary/80">{change}</p>}
            </div>
        </Card>
    );
};