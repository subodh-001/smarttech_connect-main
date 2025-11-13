import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EarningsPanel = ({ earningsData, onWithdraw, transactions = [], withdrawals = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Combine transactions (income) and withdrawals into a single list
  const allTransactions = [
    // Income transactions (completed jobs)
    ...transactions.map(t => ({
      ...t,
      type: 'income',
      date: t.completionDate || t.createdAt,
    })),
    // Withdrawal transactions
    ...withdrawals.map(w => ({
      ...w,
      type: 'withdrawal',
      date: w.createdAt,
      amount: w.amount,
      title: 'Withdrawal',
      status: w.status,
      transactionId: w.transactionId,
    })),
  ];

  // Sort all transactions by date (newest first)
  const sortedTransactions = allTransactions.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });

  const periods = [
    { key: 'daily', label: 'Today', icon: 'Calendar' },
    { key: 'weekly', label: 'This Week', icon: 'CalendarDays' },
    { key: 'monthly', label: 'This Month', icon: 'CalendarRange' }
  ];

  const currentEarnings = earningsData?.[selectedPeriod];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle" data-earnings-panel>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Earnings</h2>
        <Button
          variant="success"
          size="sm"
          onClick={onWithdraw}
          iconName="Download"
          iconPosition="left"
        >
          Withdraw
        </Button>
      </div>
      {/* Period Selector */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {periods?.map((period) => (
          <button
            key={period?.key}
            onClick={() => setSelectedPeriod(period?.key)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-smooth ${
              selectedPeriod === period?.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={period?.icon} size={16} />
            <span>{period?.label}</span>
          </button>
        ))}
      </div>
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-success/10 p-4 rounded-lg border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={20} color="var(--color-success)" />
            <span className="text-sm font-medium text-success">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-success">
            ₹
            {Number.isFinite(currentEarnings?.total)
              ? currentEarnings.total.toLocaleString('en-IN')
              : currentEarnings?.total}
          </p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Briefcase" size={20} color="var(--color-primary)" />
            <span className="text-sm font-medium text-primary">Jobs Completed</span>
          </div>
          <p className="text-2xl font-bold text-primary">{currentEarnings?.jobsCompleted}</p>
        </div>

        <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
            <span className="text-sm font-medium text-accent">Avg per Job</span>
          </div>
          <p className="text-2xl font-bold text-accent">
            ₹
            {Number.isFinite(currentEarnings?.avgPerJob)
              ? currentEarnings.avgPerJob.toLocaleString('en-IN')
              : currentEarnings?.avgPerJob}
          </p>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="space-y-4">
        <h3 className="font-medium text-text-primary">Performance Metrics</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" />
              <span className="text-sm text-text-secondary">Completion Rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${currentEarnings?.completionRate}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-text-primary">{currentEarnings?.completionRate}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Star" size={16} color="var(--color-accent)" />
              <span className="text-sm text-text-secondary">Customer Satisfaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5]?.map((star) => (
                  <Icon
                    key={star}
                    name="Star"
                    size={14}
                    color={star <= currentEarnings?.rating ? 'var(--color-accent)' : 'var(--color-border)'}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-text-primary">{currentEarnings?.rating}/5</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} color="var(--color-primary)" />
              <span className="text-sm text-text-secondary">Response Time</span>
            </div>
            <span className="text-sm font-medium text-text-primary">{currentEarnings?.responseTime}</span>
          </div>
        </div>
      </div>
      {/* Available Balance */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Available Balance</p>
            <p className="text-lg font-semibold text-text-primary">
              ₹
              {Number.isFinite(earningsData?.availableBalance)
                ? earningsData.availableBalance.toLocaleString('en-IN')
                : earningsData?.availableBalance}
            </p>
          </div>
          <Icon name="Wallet" size={24} color="var(--color-primary)" />
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-text-primary">Transaction History</h3>
          <button
            onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            className="text-sm text-primary hover:text-primary/80 flex items-center space-x-1"
          >
            <span>{showTransactionHistory ? 'Hide' : 'View All'}</span>
            <Icon 
              name={showTransactionHistory ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
            />
          </button>
        </div>

        {showTransactionHistory ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedTransactions && sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => {
                const date = transaction.date ? new Date(transaction.date) : null;
                const formattedDate = date 
                  ? date.toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : '—';
                
                const isWithdrawal = transaction.type === 'withdrawal';
                const amount = isWithdrawal 
                  ? transaction.amount 
                  : (transaction.finalCost ?? transaction.budgetMax ?? transaction.budgetMin ?? 0);
                
                const customerName = isWithdrawal
                  ? `UPI: ${transaction.upiId || 'N/A'}`
                  : (transaction.customerId?.fullName || 
                     transaction.customer?.fullName || 
                     transaction.customer?.name || 
                     transaction.customerId?.name ||
                     'Customer');

                return (
                  <div
                    key={transaction.id || transaction._id || transaction.transactionId}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${isWithdrawal ? 'bg-destructive/10' : 'bg-success/10'}`}>
                        <Icon 
                          name={isWithdrawal ? 'ArrowDown' : 'DollarSign'} 
                          size={16} 
                          color={isWithdrawal ? 'var(--color-destructive)' : 'var(--color-success)'} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {isWithdrawal ? 'Withdrawal' : (transaction.title || 'Completed Job')}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {isWithdrawal 
                            ? `${transaction.status || 'pending'} • ${formattedDate}`
                            : `${customerName} • ${formattedDate}`
                          }
                        </p>
                        {isWithdrawal && transaction.transactionId && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            ID: {transaction.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${isWithdrawal ? 'text-destructive' : 'text-success'}`}>
                        {isWithdrawal ? '-' : '+'}₹{Number.isFinite(amount) ? amount.toLocaleString('en-IN') : amount}
                      </p>
                      {!isWithdrawal && transaction.reviewRating && (
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <Icon name="Star" size={12} color="var(--color-accent)" />
                          <span className="text-xs text-text-secondary">
                            {transaction.reviewRating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-1">Completed jobs will appear here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTransactions && sortedTransactions.length > 0 ? (
              sortedTransactions.slice(0, 3).map((transaction) => {
                const date = transaction.date ? new Date(transaction.date) : null;
                const formattedDate = date 
                  ? date.toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short' 
                    })
                  : '—';
                
                const isWithdrawal = transaction.type === 'withdrawal';
                const amount = isWithdrawal 
                  ? transaction.amount 
                  : (transaction.finalCost ?? transaction.budgetMax ?? transaction.budgetMin ?? 0);
                
                const customerName = isWithdrawal
                  ? 'Withdrawal'
                  : (transaction.customerId?.fullName || 
                     transaction.customer?.fullName || 
                     transaction.customer?.name || 
                     transaction.customerId?.name ||
                     'Customer');

                return (
                  <div
                    key={transaction.id || transaction._id || transaction.transactionId}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Icon 
                        name={isWithdrawal ? 'ArrowDown' : 'CheckCircle'} 
                        size={14} 
                        color={isWithdrawal ? 'var(--color-destructive)' : 'var(--color-success)'} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {isWithdrawal ? 'Withdrawal' : (transaction.title || 'Completed Job')}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {isWithdrawal ? formattedDate : `${customerName} • ${formattedDate}`}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ml-2 ${isWithdrawal ? 'text-destructive' : 'text-success'}`}>
                      {isWithdrawal ? '-' : '+'}₹{Number.isFinite(amount) ? amount.toLocaleString('en-IN') : amount}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-text-secondary">
                <p className="text-sm">No recent transactions</p>
              </div>
            )}
            {sortedTransactions && sortedTransactions.length > 3 && (
              <button
                onClick={() => setShowTransactionHistory(true)}
                className="w-full text-sm text-primary hover:text-primary/80 py-2"
              >
                View {sortedTransactions.length - 3} more transactions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPanel;