import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function List() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    return JSON.parse(localStorage.getItem(`items-${id}`) || "[]");
  });
  const [listTitle, setListTitle] = useState("");
  const [newItem, setNewItem] = useState(() => localStorage.getItem(`newItem-${id}`) || "");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    localStorage.setItem(`newItem-${id}`, newItem);
  }, [newItem, id]);

  useEffect(() => {
    localStorage.setItem(`items-${id}`, JSON.stringify(items));
  }, [items, id]);

  const fetchListTitle = async () => {
    try {
      const res = await fetch(`${API}/get-list`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const list = data.list.find(l => l.id === id);
        if (list) setListTitle(list.title);
      }
    } catch (err) { console.error(err); }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/get-items/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setItems(prev => {
          const existingIds = prev.map(i => i.id);
          const newServerItems = data.items.filter(i => !existingIds.includes(i.id));
          return [...prev, ...newServerItems];
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchListTitle();
    fetchItems();
  }, [id]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const res = await fetch(`${API}/add-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listId: id, description: newItem }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => [...prev, data.item]);
        setNewItem("");
      } else alert(data.message);
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`${API}/delete-item/${itemId}`, { method: "POST", credentials: "include" });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === "pending" ? "completed" : "pending";
    try {
      const res = await fetch(`${API}/update-item/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
    } catch (err) { console.error(err); }
  };

  const saveEdit = async (itemId) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`${API}/update-item/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: editingText }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i.id === itemId ? data.item : i));
        setEditingId(null);
      } else alert(data.message);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <div className="p-8 max-w-4xl mx-auto">
        
        {/* Navigation & Title */}
        <div className="mb-8">
          <button 
            onClick={() => navigate("/home")} 
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">{listTitle || "Loading List..."}</h1>
        </div>

        {/* ADD ITEM INPUT */}
        <div className="mb-10 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 ring-indigo-500 focus-within:ring-2 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-3 outline-none text-lg"
            placeholder="Add a new task..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <button 
            onClick={addItem} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Add Task
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full leading-normal text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Task</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-medium">
                    No tasks found. Start by adding one above!
                  </td>
                </tr>
              )}

              {items.map(item => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    {editingId === item.id ? (
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                        className="w-full bg-indigo-50 border-b-2 border-indigo-500 outline-none px-2 py-1 font-medium"
                        autoFocus
                      />
                    ) : (
                      <span className={`text-lg font-medium ${item.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter transition-all ${
                        item.status === "completed" 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${item.status === "completed" ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                      {item.status}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => saveEdit(item.id)} className="text-emerald-600 font-bold text-sm px-2">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 font-bold text-sm px-2">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingId(item.id); setEditingText(item.description); }} 
                            className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => deleteItem(item.id)} 
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}