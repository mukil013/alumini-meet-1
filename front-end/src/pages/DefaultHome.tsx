import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/DefaultHome.css";
import { mainUrlPrefix } from "../main";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  dept: string;
  gender: string;
  phoneNumber: number;
  skills: string[];
  bio: string;
  linkedIn: string;
  github: string;
  twitter: string;
  interests: string[];
  companyName: string;
  batch: number;
  role: string;
  userId: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
}

interface Project {
  _id: string;
  projectTitle: string;
  projectDescription: string;
}

export default function DefaultHome() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = sessionStorage.getItem("user");
        // Use the stored user's id to fetch updated profile
        const response = await axios.get(`${mainUrlPrefix}/user/getUser/${userId}`);
        // Assume the API response returns updated data in response.data.userDetail
        const updatedUser = response.data.userDetail;
        setUser(updatedUser);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load profile");
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${mainUrlPrefix}/event/getAllEvents`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${mainUrlPrefix}/project/getAllProjects`);
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchUserProfile();
    fetchEvents();
    fetchProjects();
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="no-data">No user data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>{`${user.firstName} ${user.lastName}`}</h1>
        <p>{user.email}</p>
        <p><b>Education:</b> {user.dept}, {user.batch}</p>
        <div className="bio">
          <b>Bio:</b> {user.bio || "No bio available"}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="profile-card">
        <h2>Upcoming Events</h2>
        {events.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))
        )}
        <button className="view-more-btn" onClick={() => navigate("/home/event")}>View All Events</button>
      </div>

      {/* Featured Projects Section */}
      <div className="profile-card">
        <h2>Featured Projects</h2>
        {projects.length === 0 ? (
          <p>No featured projects.</p>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              <h3>{project.projectTitle}</h3>
              <p>{project.projectDescription}</p>
            </div>
          ))
        )}
        <button className="view-more-btn" onClick={() => navigate("/home/projects")}>View All Projects</button>
      </div>
    </div>
  );
}
