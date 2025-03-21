
import React from 'react';
import DonutChart from '../charts/DonutChart';
import { AssetAllocation as AssetAllocationType } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { AssetCategoryFilter } from './NetWorthChart';

interface AssetAllocationProps {
  allocation: AssetAllocationType;
  totalValue: number;
  selectedCategory?: AssetCategoryFilter;
}

const AssetAllocation: React.FC<AssetAllocationProps> = ({ 
  allocation, 
  totalValue,
  selectedCategory = 'all'
}) => {
  // Filter out zero-value and unwanted categories
  const filteredAllocation = Object.entries(allocation).reduce((acc, [key, value]) => {
    // Skip commodities and other categories
    if (key === 'commodities' || key === 'other') {
      return acc;
    }
    return {
      ...acc,
      [key]: value,
    };
  }, {});

  const chartData = {
    labels: Object.keys(filteredAllocation).map(key => {
      switch(key) {
        case 'stocks': return 'Actions';
        case 'realEstate': return 'Immobilier';
        case 'crypto': return 'Cryptomonnaies';
        case 'bankAccounts': return 'Comptes bancaires';
        case 'savingsAccounts': return 'Livrets d\'épargne';
        case 'bonds': return 'Obligations';
        default: return key;
      }
    }),
    values: Object.values(filteredAllocation) as number[],
    colors: [
      '#4ade80', // stocks - green
      '#60a5fa', // real estate - blue
      '#c084fc', // crypto - purple
      '#94a3b8', // bank accounts - gray
      '#38bdf8', // savings accounts - light blue
      '#facc15', // bonds - yellow
    ],
  };

  // Generate title based on selected category
  let title = 'Allocation d\'actifs';
  if (selectedCategory === 'savings') {
    title = 'Répartition de mon épargne';
  } else if (selectedCategory === 'investments') {
    title = 'Répartition des placements';
  }

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">Valeur totale: {formatCurrency(totalValue)}</p>
      </div>
      
      <div className="flex-grow">
        <DonutChart data={chartData} height={260} />
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(filteredAllocation).map(([key, value]) => {
            if (value === 0) return null;
            
            // Ensure value is treated as a number
            const numericValue = Number(value);
            // Calculate percentage only if totalValue is greater than 0
            const percent = totalValue > 0 ? ((numericValue / totalValue) * 100).toFixed(1) : '0.0';
            
            let label;
            switch(key) {
              case 'stocks': label = 'Actions'; break;
              case 'realEstate': label = 'Immobilier'; break;
              case 'crypto': label = 'Crypto'; break;
              case 'bankAccounts': label = 'Comptes'; break;
              case 'savingsAccounts': label = 'Livrets'; break;
              case 'bonds': label = 'Obligations'; break;
              default: label = key;
            }
            
            return (
              <div key={key} className="text-xs">
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium">{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
