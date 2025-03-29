import { useState, useEffect } from 'react';
import AddTransactionForm from './components/AddTransactionForm';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import SummaryChart from './components/SummaryChart';
import CategoryChart from './components/CategoryChart';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';



function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 3️⃣ 로그인 함수
  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.error('Login error:', error);
      });
  };

  // 4️⃣ 로그아웃 함수
  const handleLogout = () => {
    signOut(auth);
  };

  const handleAddTransaction = async (tx) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...tx,
        uid: user.uid, // ✅ 현재 로그인한 유저 ID 포함
      });
      console.log('문서 추가됨, ID:', docRef.id);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    if (!user) return; // ✅ user가 없는 상태에선 쿼리 날리지 않음
  
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid), // ✅ user.uid 반드시 일치
      orderBy('date', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(items);
    });
  
    return () => unsubscribe();
  }, [user]); // ✅ user가 바뀔 때마다 실행됨
  

  return (
    <div>
    {/* 로그인 상태에 따라 버튼 출력 */}
    {user ? (
      <div className="flex items-center gap-2 mb-4 px-6">
        <span className="text-sm text-gray-600">Welcome, {user.displayName}</span>
        <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Logout</button>
      </div>
    ) : (
      <div className="px-6">
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">Login with Google</button>
      </div>
    )}
    
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-blue-700">Simple Cash Flow Tracker</h1>
      <AddTransactionForm onAdd={handleAddTransaction} />
      <SummaryChart transactions={transactions} />
      <CategoryChart transactions={transactions} />

      {/* 요약 */}
      <div className="bg-white p-4 rounded shadow-md space-y-1">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p className="text-green-600">
          Income: ${transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0)
            .toFixed(2)}
        </p>
        <p className="text-red-600">
          Expense: ${transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
            .toFixed(2)}
        </p>
        <p className="font-bold text-blue-700">
          Balance: ${(transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0) -
            transactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
        </p>
      </div>


      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li
          key={tx.id}
          className={`flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-3 rounded shadow ${
            tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <div>
            <span className="font-medium">{tx.description}</span>
            <p className="text-sm text-gray-500">{tx.category || 'Uncategorized'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {tx.type === 'income' ? '+' : '-'}${tx.amount}
            </span>
            <button
              onClick={() => handleDelete(tx.id)}
              className="text-sm text-red-500 hover:underline"
            >
              ❌
            </button>
          </div>
        </li>         
        ))}
      </ul>

    </div>
  </div>
)
};

export default App;
