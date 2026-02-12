import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header.jsx";

export default function Home() {
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
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
      const res = await axios.post(
        `${API}/add-list`,
        { listTitle: title },
        { withCredentials: true }
      );
      if (res.data.success) {
        setLists(prev => [res.data.list, ...prev]);
        inputRef.current.focus(); // keep focus
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

        <div className="mb-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="New list title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-md"
          />
          <button
            onClick={addList}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add
          </button>
        </div>

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
