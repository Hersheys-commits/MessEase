import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import api from "../utils/axiosRequest";
import toast from "react-hot-toast";
import axios from "axios";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // await axios.post("/")
      // console.log("API",api);
      // await new Promise((resolve) => setTimeout(resolve,100* 1000));
      const res = await api.post("/api/student/logout", {}); // this is not working
      console.log("logout", res);
      dispatch(logout());
      toast.success("Logged out successfully!");
      console.log("firstfsghsdfhsfdhfhshfdgjghdfghd\nasgagagttgewrgttawg");
      navigate("/student/login"); // this doesnt work
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold">Home Page</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white hover:bg-red-600 p-2 rounded transition duration-200"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
