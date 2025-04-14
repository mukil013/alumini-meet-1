import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./style/Events.css";
import loader from "../assets/Iphone-spinner-2.gif";
import { mainUrlPrefix } from "../main";

interface Event {
  _id: string;
  eventTitle: string;
  eventDescription: string;
  applyLink: string;
  eventImg?: {
    data: string;
    contentType: string;
  };
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${mainUrlPrefix}/event/getAllEvents`);
      if (response.data.status === "Success") {
        setEvents(response.data.events);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading)
    return (
      <div className="loading">
        <img src={loader} alt="Loading..." />
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  const openDescriptionDialog = (description: string) => {
    setSelectedDescription(description);
    setIsDialogOpen(true);
  };

  const closeDescriptionDialog = () => {
    setIsDialogOpen(false);
    setSelectedDescription("");
  };

  const getImageUrl = (event: Event) => {
    if (!event.eventImg) return "https://via.placeholder.com/150";
    
    // Handle the image data based on its type
    let imageData = event.eventImg.data;
    
    // If it's not already a string, try to convert it
    if (typeof imageData !== 'string') {
      try {
        // Use a more browser-compatible approach
        const uint8Array = new Uint8Array(Object.values(imageData));
        imageData = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
      } catch (error) {
        console.error("Error converting image data:", error);
        return "https://via.placeholder.com/150";
      }
    }
      
    return `data:${event.eventImg.contentType};base64,${imageData}`;
  };

  return (
    <>
      <ul id="events-body">
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          events.map((event) => (
            <li key={event._id} className="event-container">
              <img
                src={getImageUrl(event)}
                alt={event.eventTitle}
                loading="lazy"
              />
              <div className="event-details">
                <div className="event-title">{event.eventTitle}</div>
                <div
                  className="event-description"
                  onClick={() => openDescriptionDialog(event.eventDescription)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {event.eventDescription.slice(0, 50)}...
                </div>
              </div>
              <button
                onClick={() => window.open(event.applyLink, "_blank")}
                className="register-btn-events"
              >
                Register
              </button>
            </li>
          ))
        )}
      </ul>

      {isDialogOpen && (
        <div className="dialog-overlay" onClick={closeDescriptionDialog}>
          <dialog className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h2>Event Description</h2>
            <p>{selectedDescription}</p>
            <button onClick={closeDescriptionDialog}>Close</button>
          </dialog>
        </div>
      )}
    </>
  );
}
