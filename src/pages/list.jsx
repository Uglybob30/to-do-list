import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function List() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", status: "Pending" });

  // Modal state for editing
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState({ id: null, title: "", status: "Pending" });

  // Fetch all list items
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-list`, { withCredentials: true });
      if (res.data.success) setData(res.data.list);
      else setData([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new item
  const handleAdd = async () => {
    if (!newItem.description.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/add-list`,
        {
          listTitle: newItem.description,
          status: newItem.status,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        fetchData();
        setNewItem({ description: "", status: "Pending" });
      } else alert(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      const res = await axios.post(`${API_URL}/delete-list/${id}`, {}, { withCredentials: true });
      if (res.data.success) setData(data.filter((item) => item.id !== id));
      else alert(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  // Save edited item
  const handleEditSave = async () => {
    if (!editItem.title.trim()) return;

    try {
      const res = await axios.put(
        `${API_URL}/edit-list/${editItem.id}`,
        {
          title: editItem.title,
          status: editItem.status,
        },
        { withCredentials: true } // ✅ this fixes the “not saving” issue
      );

      if (res.data.success) {
        fetchData();
        setShowModal(false);
        setEditItem({ id: null, title: "", status: "Pending" });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="p-8 flex flex-col items-center">
        <button
          onClick={() => navigate("/home")}
          className="self-start mb-4 text-gray-600 hover:underline"
        >
          ← Back to home
        </button>

        <h1 className="text-4xl font-bold mb-6 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-xl shadow-lg">
          LIST
        </h1>

        {/* ADD FORM */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 w-full max-w-4xl flex gap-4">
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="border rounded px-3 py-2 flex-1"
          />

          <select
            value={newItem.status}
            onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto w-full max-w-4xl">
          <table className="w-full border-collapse shadow-lg rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300">
                <th className="px-6 py-3 border">ID</th>
                <th className="px-6 py-3 border">Description</th>
                <th className="px-6 py-3 border">Status</th>
                <th className="px-6 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} text-center`}
                >
                  <td className="px-6 py-2 border">{item.id}</td>
                  <td className="px-6 py-2 border">{item.title}</td>
                  <td className="px-6 py-2 border">{item.status}</td>
                  <td className="px-6 py-2 border space-x-2">
                    <button
                      onClick={() => {
                        setEditItem({ id: item.id, title: item.title, status: item.status });
                        setShowModal(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">Edit Item</h2>

              <input
                type="text"
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="Description"
              />

              <select
                value={editItem.status}
                onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default List;
