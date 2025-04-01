import "./style/AdminHome.css";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

export default function AdminHome() {
  return (
    <div className="home-body">
      <AdminNav />
      <div className="outlet">
        <Outlet />
      </div>
    </div>
  );
}
