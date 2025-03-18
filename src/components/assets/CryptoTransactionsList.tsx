
import React from 'react';
import { Transaction } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CryptoTransactionsListProps {
  transactions: Transaction[];
}

const CryptoTransactionsList: React.FC<CryptoTransactionsListProps> = ({ transactions }) => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historique des transactions</h3>
      <div className="space-y-2">
        {sortedTransactions.map((transaction) => (
          <div 
            key={transaction.id} 
            className="p-4 border rounded-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium flex items-center gap-1">
                  {transaction.type === 'buy' ? (
                    <ArrowUpRight size={16} className="text-green-600" />
                  ) : (
                    <ArrowDownRight size={16} className="text-red-600" />
                  )}
                  <span className={cn(
                    transaction.type === 'buy' ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === 'buy' ? 'Achat' : 'Vente'}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'dd/MM/yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {transaction.quantity} × {formatCurrency(transaction.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(transaction.total)}
                </p>
                {transaction.performance !== undefined && (
                  <p className={cn(
                    "text-xs flex items-center justify-end gap-1",
                    transaction.performance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.performance >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    Performance: {transaction.performance > 0 ? "+" : ""}{formatPercentage(transaction.performance)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTransactionsList;
