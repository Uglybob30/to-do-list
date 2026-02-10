import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    if (!u) return navigate("/");
    setUser(u);
    loadLists(u.id);
  }, []);

  const loadLists = async (userId) => {
    const res = await fetch(`${API_URL}/list/${userId}`);
    setLists(await res.json());
  };

  const addList = async () => {
    if (!newTitle.trim()) return;

    await fetch(`${API_URL}/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        status: "Active",
        user_id: user.id,
      }),
    });

    setNewTitle("");
    loadLists(user.id);
  };

  const editList = async (id, oldTitle) => {
    const title = prompt("Edit list title:", oldTitle);
    if (!title) return;

    await fetch(`${API_URL}/list/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    loadLists(user.id);
  };

  const deleteList = async (id) => {
    if (!confirm("Delete this list?")) return;

    await fetch(`${API_URL}/list/${id}`, { method: "DELETE" });
    loadLists(user.id);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-blue-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-4">
        Welcome, {user.name}
      </h1>

      <div className="flex justify-center gap-2 mb-6">
        <input
          className="px-3 py-2 rounded border"
          placeholder="New list title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          onClick={addList}
          className="bg-green-600 text-white px-4 rounded"
        >
          Add List
        </button>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 max-w-xl mx-auto">
        {lists.map((list) => (
          <div
            key={list.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div
              onClick={() => navigate(`/list/${list.id}`)}
              className="cursor-pointer font-semibold hover:text-blue-600"
            >
              {list.title}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editList(list.id, list.title)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deleteList(list.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
