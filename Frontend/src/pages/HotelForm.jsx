import { useState } from "react";

const HostelForm = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalRooms, setTotalRooms] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, location, totalRooms });
    // Send data to backend
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Create Hostel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Hostel Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Total Rooms"
          value={totalRooms}
          onChange={(e) => setTotalRooms(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default HostelForm;
