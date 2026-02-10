import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function List() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [newItem, setNewItem] = useState("");
  const navigate = useNavigate();

  // ======================
  // FETCH ITEMS
  // ======================
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/get-items/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // FETCH LIST TITLE
  // ======================
  const fetchListTitle = async () => {
    try {
      const res = await fetch(`${API}/get-list`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const list = data.list.find((l) => l.id === id);
        if (list) setListTitle(list.title);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchListTitle();
  }, [id]);

  // ======================
  // ADD ITEM
  // ======================
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
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // DELETE ITEM
  // ======================
  const deleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`${API}/delete-item/${itemId}`, { method: "POST", credentials: "include" });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // TOGGLE STATUS
  // ======================
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
      if (data.success) {
        setItems(prev => prev.map(i => i.id === item.id ? data.item : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header />

      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate("/home")} className="mb-4 text-blue-700 hover:underline">
          ← Back to lists
        </button>

        <h1 className="text-2xl font-bold mb-4">{listTitle}</h1>

        {/* Add Item */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="flex-1 border px-3 py-2 rounded-md"
            placeholder="New item description..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button
            onClick={addItem}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add Item
          </button>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-amber-300 text-blue-700">ID</th>
                <th className="px-6 py-3 bg-amber-200 text-blue-700">Description</th>
                <th className="px-6 py-3 bg-amber-300 text-blue-700">Status</th>
                <th className="px-6 py-3 bg-amber-200 text-blue-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No items yet
                  </td>
                </tr>
              )}

              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{item.id}</td>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`px-2 py-1 rounded ${
                        item.status === "completed" ? "bg-green-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
