// src/components/SummaryChart.jsx
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#00C49F', '#FF8042']; // income, expense 색상

function SummaryChart({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const data = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense },
  ];

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-2">Income vs Expense</h2>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default SummaryChart;
