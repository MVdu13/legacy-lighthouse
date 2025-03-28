
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, PiggyBankIcon, TrendingUpIcon, Target } from 'lucide-react';

interface KeyMetricsProps {
  totalIncome: number;
  totalExpenses: number;
  savingsAmount: number;
  monthlyProjectsContribution: number;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({
  totalIncome,
  totalExpenses,
  savingsAmount,
  monthlyProjectsContribution
}) => {
  const investmentCapacity = Math.max(0, savingsAmount - monthlyProjectsContribution);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="bg-white">
        <CardContent className="flex items-center p-6">
          <div className="rounded-full p-3 bg-green-100 mr-4">
            <ArrowUpIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Revenus</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalIncome)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="flex items-center p-6">
          <div className="rounded-full p-3 bg-red-100 mr-4">
            <ArrowDownIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dépenses</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalExpenses)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="flex items-center p-6">
          <div className="rounded-full p-3 bg-blue-100 mr-4">
            <PiggyBankIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Épargne</p>
            <h3 className="text-2xl font-bold">{formatCurrency(savingsAmount)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="flex items-center p-6">
          <div className="rounded-full p-3 bg-indigo-100 mr-4">
            <Target className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Allocation projets</p>
            <h3 className="text-2xl font-bold">{formatCurrency(monthlyProjectsContribution)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="flex items-center p-6">
          <div className="rounded-full p-3 bg-amber-100 mr-4">
            <TrendingUpIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Capacité d'invest.</p>
            <h3 className="text-2xl font-bold">{formatCurrency(investmentCapacity)}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;
