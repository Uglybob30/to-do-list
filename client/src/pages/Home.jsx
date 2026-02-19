import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";

export default function Home() {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem("myLists");
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ======================
  // SESSION CHECK
  // ======================
  const checkSession = async () => {
    try {
      const res = await axios.get(`${API}/get-session`, { withCredentials: true });
      if (!res.data.session) navigate("/");
      return res.data.session;
    } catch (err) {
      console.error(err);
      navigate("/");
      return false;
    }
  };

  // ======================
  // FETCH LISTS
  // ======================
  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API}/get-list`, { withCredentials: true });
      if (res.data.success) {
        setLists(res.data.list);
        localStorage.setItem("myLists", JSON.stringify(res.data.list));
        res.data.list.forEach(l => {
          const key = `items-${l.id}`;
          if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
        });
      }
    } catch (err) {
      console.error(err);
      const saved = JSON.parse(localStorage.getItem("myLists") || "[]");
      if (saved.length > 0) setLists(saved);
    }
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkSession();
      if (ok) fetchLists();
    };
    init();
  }, []);

  useEffect(() => {
    localStorage.setItem("myLists", JSON.stringify(lists));
  }, [lists]);

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    try {
      await axios.get(`${API}/logout`, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // ADD LIST
  // ======================
  const addList = async () => {
    if (!title.trim()) return;
    try {
      const res = await axios.post(`${API}/add-list`, { listTitle: title }, { withCredentials: true });
      if (res.data.success) {
        setLists(prev => [res.data.list, ...prev]);
        setTitle("");
        inputRef.current.focus();
        localStorage.setItem(`items-${res.data.list.id}`, JSON.stringify([]));
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // DELETE LIST
  // ======================
  const deleteList = async (id) => {
    if (!confirm("Delete this list?")) return;
    try {
      await axios.post(`${API}/delete-list/${id}`, {}, { withCredentials: true });
      setLists(prev => prev.filter(l => l.id !== id));
      localStorage.removeItem(`items-${id}`);
      localStorage.removeItem(`newItem-${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // EDIT LIST
  // ======================
  const startEditing = (list) => {
    setEditingId(list.id);
    setEditingText(list.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await axios.post(`${API}/update-list/${id}`, { listTitle: editingText }, { withCredentials: true });
      if (res.data.success) {
        setLists(prev => prev.map(l => (l.id === id ? { ...l, title: editingText } : l)));
        cancelEditing();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <div className="p-8 max-w-2xl mx-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">Workspace</h1>
            <p className="text-slate-500 mt-1">Organize your tasks efficiently.</p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Logout
          </button>
        </div>

        {/* ADD LIST */}
        <div className="mb-10 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Name your new list..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent px-4 py-3 outline-none text-lg"
            onKeyDown={(e) => e.key === "Enter" && addList()}
          />
          <button
            onClick={addList}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            Create List
          </button>
        </div>

        {/* LISTS DISPLAY */}
        <div className="grid gap-4">
          {lists.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-medium">Your workspace is empty.</p>
            </div>
          )}

          {lists.map((list) => (
            <div
              key={list.id}
              className="group flex justify-between items-center rounded-2xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer"
              onClick={() => editingId === null && navigate(`/list/${list.id}`)}
            >
              {/* TITLE / EDIT */}
              <div className="flex-1 pr-4">
                {editingId === list.id ? (
                  <input
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(list.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border-b-2 border-indigo-500 py-1 outline-none text-xl font-bold w-full bg-indigo-50"
                  />
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {list.title}
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">
                      View details →
                    </span>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 items-center">
                {editingId === list.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); saveEdit(list.id); }}
                      className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(list); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                      title="Edit Title"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="Delete List"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
