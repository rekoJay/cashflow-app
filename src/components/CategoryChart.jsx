import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function CategoryChart({ transactions }) {
  // 1. 지출 항목만 필터
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  // 2. 카테고리별 금액 합산
  const categoryTotals = expenseTransactions.reduce((acc, curr) => {
    const category = curr.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category] += curr.amount;
    return acc;
  }, {});

  // 3. 차트용 데이터 형태로 변환
  const data = Object.entries(categoryTotals).map(([category, total]) => ({
    category,
    total,
  }));

  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#AA46BE'];

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-2">Category Breakdown (Expenses)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;
