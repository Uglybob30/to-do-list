import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";

function Home() {
  const navigate = useNavigate();

  const lists = [
    { title: "Work Tasks", desc: "Office and project tasks" },
    { title: "Shopping", desc: "Groceries and errands" },
    { title: "Personal", desc: "Health and hobbies" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My To-Do Lists</h1>

        {lists.map((list, index) => (
          <div
            key={index}
            onClick={() => navigate("/list")}
            className="cursor-pointer bg-white p-4 mb-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <h2 className="font-semibold">{list.title}</h2>
            <p className="text-sm text-gray-500">{list.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
