import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function ListItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState("Pending");

  const load = async () => {
    const res = await fetch(`${API_URL}/items/${id}`);
    setItems(await res.json());
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!desc.trim()) return;
    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list_id: id, description: desc, status }),
    });
    setDesc(""); setStatus("Pending"); load();
  };

  const del = async (itemId) => {
    await fetch(`${API_URL}/items/${itemId}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button onClick={() => navigate("/home")} className="mb-4 bg-gray-300 px-4 py-2 rounded">← Back</button>

      <div className="flex gap-2 mb-4">
        <input className="flex-1 px-3 py-2 border rounded" value={desc}
          onChange={e => setDesc(e.target.value)} placeholder="New item" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border rounded">
          <option>Pending</option>
          <option>Done</option>
        </select>
        <button onClick={add} className="bg-green-600 text-white px-4 rounded">Add</button>
      </div>

      {items.map(i => (
        <div key={i.id} className="bg-white p-3 mb-2 rounded flex justify-between">
          <span>{i.description} ({i.status})</span>
          <button onClick={() => del(i.id)} className="text-red-600">Delete</button>
        </div>
      ))}
    </div>
  );
}

export default ListItem;
