import "./style/Home.css";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-body">
      <Navbar />
      <div className="outlet">
        <Outlet />
      </div>
    </div>
  );
}
