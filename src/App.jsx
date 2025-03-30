import { useState, useEffect } from 'react';
import AddTransactionForm from './components/AddTransactionForm';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  deleteDoc
} from 'firebase/firestore';
import SummaryChart from './components/SummaryChart';
import CategoryChart from './components/CategoryChart';
import { auth, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import Papa from 'papaparse';



function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleUpdateTransaction = async (id, updatedTx) => {
    console.log("🔥 수정 실행됨", id, updatedTx);
    try {
      const docRef = doc(db, 'transactions', id);
      await updateDoc(docRef, {
        ...updatedTx,
        uid: user.uid, // ✅ 사용자 UID를 반드시 유지
      });
    } catch (error) {
      console.error('거래 수정 중 오류:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
    }
  };

  const handleCSVUpload = () => {
    if (!selectedFile) return alert("📂 파일을 먼저 선택하세요");

    console.log("👤 유저 UID:", user?.uid);
  
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const parsedData = results.data;
        console.log("✅ 파싱 완료:", parsedData);
  
        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          alert("⚠️ CSV 파일이 비어있거나 잘못된 형식입니다.");
          return;
        }
  
        for (let row of parsedData) {
          // 필드 유효성 검사
          if (!row.date || !row.amount || !row.type) {
            console.warn("⚠️ 유효하지 않은 행:", row); // ← 이건 조건 안에서만 실행!
            continue;
          }
  
          try {
            const newTx = {
              amount: parseFloat(row.amount),
              type: row.type,
              description: row.description,
              category: row.category,
              date: new Date(row.date.replace(/–|—/g, '-')).toISOString(),
              uid: user.uid,
            };
            console.log("🔥 업로드 시도:", newTx)
            await addDoc(collection(db, 'transactions'), newTx);
          } catch (err) {
            console.error("❌ 업로드 실패:", err);
          }
        }
  
        alert("✅ CSV 업로드 완료!");
      },
    });
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
      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <AddTransactionForm
        onAdd={handleAddTransaction}
        editingTransaction={editingTransaction}
        onUpdate={handleUpdateTransaction}
        clearEditing={() => setEditingTransaction(null)}
      />
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-semibold mb-2">📥 CSV Upload</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="w-full border border-gray-300 p-2 rounded"
        />
        <button
          onClick={handleCSVUpload}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          📥 Upload CSV
        </button>
      </div>


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
        {transactions
          .filter((tx) =>
            tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((tx) => (
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
                <button
                  onClick={() => {
                    console.log("수정 버튼 클릭됨:", tx);
                    setEditingTransaction(tx);
                  }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  ✏️
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
