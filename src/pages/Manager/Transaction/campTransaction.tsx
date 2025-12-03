import React, { useEffect, useState } from 'react';
import { Spin, Tag } from 'antd';
import { Search, DollarSign, CreditCard } from 'lucide-react';
import { useManagerContext } from '../../../hooks/useManagerContext';
import { useNotification } from '../../../contexts/NotificationContext';
import transactionService, { type TransactionResponseDto } from '../../../services/transactionService';

const CampTransaction: React.FC = () => {
  const { selectedCampId } = useManagerContext();
  const { toastError } = useNotification();

  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Fetch transactions when camp is selected
  useEffect(() => {
    if (!selectedCampId) {
      setTransactions([]);
      return;
    }

    fetchTransactions();
  }, [selectedCampId]);

  const fetchTransactions = async () => {
    if (!selectedCampId) return;

    try {
      setLoading(true);
      const data = await transactionService.getTransactionsByCampId(selectedCampId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toastError('Error', 'Unable to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !transaction.transactionCode.toLowerCase().includes(query) &&
        !transaction.campName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(transaction.status)) {
      return false;
    }
    return true;
  });

  // Get unique statuses for filters
  const uniqueStatuses = Array.from(new Set(transactions.map(t => t.status)));

  // Calculate status counts
  const statusCounts: Record<string, number> = {};
  transactions.forEach((transaction) => {
    statusCounts[transaction.status] = (statusCounts[transaction.status] || 0) + 1;
  });

  // Calculate statistics - only Confirmed transactions
  const confirmedTransactions = filteredTransactions.filter(t => t.status === 'Confirmed');
  const totalAmount = confirmedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string }> = {
      Success: { color: 'green' },
      Pending: { color: 'orange' },
      Failed: { color: 'red' },
      Cancelled: { color: 'gray' },
    };

    const config = statusConfig[status] || { color: 'default' };
    return <Tag color={config.color}>{status}</Tag>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string }> = {
      Payment: { color: 'blue' },
      Refund: { color: 'purple' },
      Deposit: { color: 'cyan' },
    };

    const config = typeConfig[type] || { color: 'default' };
    return <Tag color={config.color}>{type}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle status checkbox
  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleAllStatusToggle = () => {
    setSelectedStatuses([]);
  };

  const isAllSelected = selectedStatuses.length === 0;

  // If no camp selected
  if (!selectedCampId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Select Camp</h3>
          <p className="text-indigo-700 text-base leading-relaxed">
            Please select a camp from the left sidebar to view transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          View and manage camp transactions and payments
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Filters & Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 sticky top-6 space-y-6">
              <h3 className="text-lg font-bold text-[#111827]">Filters</h3>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Code or camp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm text-[#6B7280] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-3 uppercase tracking-wider">
                  Status
                </label>
                <div className="space-y-2">
                  {/* All checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleAllStatusToggle}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                    />
                    <span className="text-sm text-[#374151] group-hover:text-[#111827] font-medium">
                      All
                    </span>
                    <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                      {transactions.length}
                    </span>
                  </label>

                  {/* Individual status checkboxes */}
                  {uniqueStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#6366F1] focus:ring-[#6366F1] focus:ring-2 bg-white"
                      />
                      <span className="text-sm text-[#374151] group-hover:text-[#111827]">
                        {status}
                      </span>
                      <span className="text-xs font-semibold text-[#6366F1] bg-[#EFF6FF] px-2 py-0.5 rounded-full ml-auto">
                        {statusCounts[status] || 0}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Section - Transactions List */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#111827]">
                  Found: {filteredTransactions.length} transaction(s)
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Transaction Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-[#6B7280]"
                        >
                          <DollarSign size={48} className="mx-auto mb-4 text-[#9CA3AF]" />
                          <p className="text-base font-medium">No transactions found</p>
                          <p className="text-sm mt-1">Transactions will appear here once payments are made</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <tr
                          key={transaction.transactionId}
                          className="hover:bg-[#F9FAFB] transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-mono text-[#6B7280]">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-[#111827]">
                            {transaction.transactionCode}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-4">
                            {getTypeBadge(transaction.type)}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-[#9CA3AF]" />
                              <span className="text-sm text-[#6B7280]">
                                {transaction.method}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B7280]">
                            {formatDateTime(transaction.transactionTime)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              {filteredTransactions.length > 0 && (
                <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#6B7280]">
                      Showing {filteredTransactions.length} of {transactions.length} transaction(s)
                    </div>
                    <div className="text-lg font-bold text-[#111827]">
                      Total Amount: {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampTransaction;
