

import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/bookingService';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { CalendarDaysIcon } from '../../components/icons/CalendarDaysIcon';
import { CurrencyDollarIcon } from '../../components/icons/CurrencyDollarIcon';
import { UserGroupIcon } from '../../components/icons/UserGroupIcon';
import { TrialBanner } from '../../components/admin/TrialBanner';

interface DashboardStats {
    upcomingBookingsCount: number;
    revenueThisMonth: number;
    busiestTrainer: {
        name: string;
        count: number;
    };
}

export interface TrialStatus {
    daysRemaining: number;
    staffCount: number;
    maxStaff: number;
}

interface DashboardViewProps {
    trialStatus: TrialStatus | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ trialStatus }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const statsData = getDashboardStats();
        setStats(statsData);
    }, []);

    if (!stats) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {trialStatus && (
                <TrialBanner
                    daysRemaining={trialStatus.daysRemaining}
                    staffCount={trialStatus.staffCount}
                    maxStaff={trialStatus.maxStaff}
                />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Upcoming Bookings"
                    value={stats.upcomingBookingsCount}
                    icon={<CalendarDaysIcon className="w-6 h-6" />}
                />
                <DashboardCard
                    title="Revenue This Month"
                    value={`$${stats.revenueThisMonth.toFixed(2)}`}
                    icon={<CurrencyDollarIcon className="w-6 h-6" />}
                />
                 <DashboardCard
                    title="Busiest Trainer"
                    value={stats.busiestTrainer.count}
                    change={stats.busiestTrainer.name !== 'N/A' ? stats.busiestTrainer.name : 'No upcoming bookings'}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                />
            </div>
        </div>
    );
};