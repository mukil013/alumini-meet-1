import { useEffect, useState } from "react";
import axios from "axios";
import "./style/PlacementInfo.css";
import { mainUrlPrefix } from "../../main";

// Define the type for a placement object
interface Placement {
  _id?: string;
  companyName: string;
  jobRole: string;
  jobType: string;
  location: string;
  applyLink: string;
  companyImageUrl: string;
  jobDescription: string;
}

export default function PlacementInfo() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newPlacement, setNewPlacement] = useState<Placement>({
    companyName: "",
    jobRole: "",
    jobType: "",
    location: "",
    applyLink: "",
    companyImageUrl: "",
    jobDescription: "",
  });

  useEffect(() => {
    const fetchAllPlacements = async () => {
      try {
        const response = await axios.get<Placement[]>(
          `${mainUrlPrefix}/placement/getAllPlacement`
        );
        setPlacements(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching placements:", error);
        setError("Failed to load placements. Please try again later.");
        setLoading(false);
      }
    };
    fetchAllPlacements();
  }, []);

  const handleAddPlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Placement>(
        `${mainUrlPrefix}/placement/addPlacement`,
        newPlacement
      );
      setPlacements([...placements, response.data]);
      setIsAddDialogOpen(false);
      setNewPlacement({
        companyName: "",
        jobRole: "",
        jobType: "",
        location: "",
        applyLink: "",
        companyImageUrl: "",
        jobDescription: "",
      });
      alert("Placement added successfully!");
    } catch (error) {
      console.error("Error adding placement:", error);
      alert("Failed to add placement. Please try again.");
    }
  };

  return (
    <div className="placement-container">
      <button className="add-btn" onClick={() => setIsAddDialogOpen(true)}>
        Add Placement
      </button>

      <div className="placements-grid">
        {placements.map((placement) => (
          <div key={placement._id} className="placement-card">
            <img
              src={
                placement.companyImageUrl || "https://via.placeholder.com/150"
              }
              alt={`${placement.companyName} logo`}
              className="company-logo"
            />
            <h2>{placement.companyName}</h2>
            <p>
              <strong>Role:</strong> {placement.jobRole}
            </p>
            <p>
              <strong>Type:</strong> {placement.jobType}
            </p>
            <p>
              <strong>Location:</strong> {placement.location}
            </p>
          </div>
        ))}
      </div>

      {isAddDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2>Add New Placement</h2>
            <form onSubmit={handleAddPlacement}>
              <label>
                <p>Company Name:</p>
                <input
                  type="text"
                  name="companyName"
                  value={newPlacement.companyName}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, companyName: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <p>Job Role:</p>
                <input
                  type="text"
                  name="jobRole"
                  value={newPlacement.jobRole}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, jobRole: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <p>Job Type:</p>
                <select
                name="jobType"
                  value={newPlacement.jobType}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, jobType: e.target.value })
                  }
                  required
                >
                  <option value="" selected disabled>Not Selected</option>
                  <option value="on-site">On-Site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="wfh">Work from home</option>
                </select>
              </label>
              <label>
                <p>Location:</p>
                <input
                  type="text"
                  name="location"
                  value={newPlacement.location}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, location: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <p>Apply Link:</p>
                <input
                  type="text"
                  name="applyLink"
                  value={newPlacement.applyLink}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, applyLink: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                <p>Company Image URL:</p>
                <input
                  type="text"
                  name="companyImageUrl"
                  value={newPlacement.companyImageUrl}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, companyImageUrl: e.target.value })
                  }
                />
              </label>
              <label>
                <p>Job Description:</p>
                <textarea
                  name="jobDescription"
                  value={newPlacement.jobDescription}
                  onChange={(e) =>
                    setNewPlacement({ ...newPlacement, jobDescription: e.target.value })
                  }
                  required
                />
              </label>
              <div className="dialog-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
