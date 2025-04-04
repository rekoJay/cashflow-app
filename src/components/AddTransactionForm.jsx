import React, { useState, useEffect } from 'react';

function AddTransactionForm({ onAdd, editingTransaction, onUpdate, clearEditing }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category || '');
    }
  }, [editingTransaction]);
  
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other'];
  const expenseCategories = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];
    
  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;
  
    const newTransaction = {
      amount: parseFloat(amount),
      type,
      description,
      category,
      date: new Date().toISOString(),
    };
  
    if (editingTransaction) {
      onUpdate(editingTransaction.id, newTransaction); // ✅ 먼저 수정 실행
    } else {
      onAdd(newTransaction); // ✅ 수정이 아닐 때만 추가
    }
  
    clearEditing(); // ✅ 그 후에 상태 초기화
    setAmount('');
    setType('income');
    setDescription('');
    setCategory('');
  };
  

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md space-y-3">
      <h2 className="text-lg font-semibold">Add Transaction</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
       <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Select Category</option>
          {currentCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editingTransaction ? 'Update' : 'Add'}
        </button>
    </form>
  );
}

export default AddTransactionForm;
