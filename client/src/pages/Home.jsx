import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

export default function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ======================
  // CHECK SESSION FIRST
  // ======================
  const checkSession = async () => {
    try {
      const res = await fetch(`${API}/get-session`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!data.session) {
        navigate("/login");
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  // ======================
  // FETCH LISTS
  // ======================
  const fetchLists = async () => {
    try {
      const res = await fetch(`${API}/get-list`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setLists(data.list);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // LOGOUT
  // ======================
  const logout = async () => {
    await fetch(`${API}/logout`, { credentials: "include" });
    navigate("/login");
  };

  useEffect(() => {
    const init = async () => {
      const ok = await checkSession();
      if (ok) fetchLists();
    };
    init();
  }, []);

  // ======================
  // ADD LIST
  // ======================
  const addList = async () => {
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API}/add-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listTitle: title }),
      });
      const data = await res.json();

      if (data.success) {
        // Keep the input value as-is so it remains typed
        setLists(prev => [data.list, ...prev]);
        // <-- REMOVE setTitle("") so it does not clear
      } else {
        alert(data.message);
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
      await fetch(`${API}/delete-list/${id}`, { method: "POST", credentials: "include" });
      setLists(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Lists</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Add list */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border px-3 py-2 rounded-md"
            placeholder="New list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={addList}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add
          </button>
        </div>

        {/* Lists */}
        <div className="space-y-2">
          {lists.length === 0 && <p className="text-gray-500">No lists yet.</p>}
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex justify-between items-center rounded-lg bg-amber-200 p-4 shadow hover:bg-amber-300 transition cursor-pointer"
            >
              <div onClick={() => navigate(`/list/${list.id}`)}>
                <h2 className="text-blue-700 font-semibold">{list.title}</h2>
                <p className="text-gray-600 text-sm">Status: {list.status}</p>
              </div>
              <button
                onClick={() => deleteList(list.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
