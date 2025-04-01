import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import "./style/Projects.css";
import { mainUrlPrefix } from "../main";

interface Refferal{
  _id: string;
  referraltitle: string;
  jobDescription: string;
  applyLink: string;
  userId: string;
}

export default function Referrals() {
  const userId = sessionStorage.getItem("user")!;
  const role = sessionStorage.getItem("role")!;
  const [tab, setTab] = useState("Explore");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addReferralForm, setAddReferralForm] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Refferal | null>(null);
  const [formData, setFormData] = useState({
    referraltitle: "",
    jobDescription: "",
    applyLink: "",
  });

  // Fetch referrals based on the selected tab
  const fetchReferrals = useCallback(async () => {
    try {
      let endpoint = "";
      if (tab === "Explore") {
        endpoint = `${mainUrlPrefix}/referral/getAllReferrals`;
      } else if (tab === "Yours") {
        endpoint = `${mainUrlPrefix}/referral/getUserReferrals/${userId}`;
      }
      const response = await axios.get(endpoint);
      setReferrals(
        tab === "Explore"
          ? response.data.referral || []
          : response.data.referrals || []
      );
    } catch (err) {
      console.error("Failed to fetch referrals:", err);
      setError("Failed to fetch referrals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId, tab]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Handle input changes for the add/edit form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new referral
  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        referraltitle: formData.referraltitle,
        jobDescription: formData.jobDescription,
        applyLink: formData.applyLink,
      };
      const response = await axios.post(
        `${mainUrlPrefix}/referral/addReferral/${userId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "Success") {
        setAddReferralForm(false);
        setFormData({ referraltitle: "", jobDescription: "", applyLink: "" });
        fetchReferrals();
      }
    } catch (error) {
      console.error("Failed to add referral:", error);
    }
  };

  // Delete a referral
  const handleDeleteReferral = async (referralId: string) => {
    try {
      await axios.delete(
        `${mainUrlPrefix}/referral/deleteReferral/${referralId}`
      );
      fetchReferrals();
    } catch (error) {
      console.error("Failed to delete referral:", error);
    }
  };

  // Edit a referral (using PATCH)
  const handleEditReferral = async (e: React.FormEvent, referralId: string) => {
    e.preventDefault();
    try {
      const payload = {
        referraltitle: formData.referraltitle,
        jobDescription: formData.jobDescription,
        applyLink: formData.applyLink,
      };
      const response = await axios.patch(
        `${mainUrlPrefix}/referral/editReferral/${referralId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "Success") {
        setEditingReferral(null);
        setAddReferralForm(false);
        setFormData({ referraltitle: "", jobDescription: "", applyLink: "" });
        fetchReferrals();
      }
    } catch (error) {
      console.error("Failed to edit referral:", error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="projects-container">
      {/* Tabs for Explore and Yours */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "Explore" ? "active" : ""}`}
          onClick={() => setTab("Explore")}
        >
          Explore
        </button>
        {role === "alumini" && (
          <button
            type="button"
            className={`tab ${tab === "Yours" ? "active" : ""}`}
            onClick={() => setTab("Yours")}
          >
            Yours
          </button>
        )}
      </div>

      {/* For alumni, show add referral button in the "Yours" tab */}
      {role === "alumini" && tab === "Yours" && (
        <button
          type="button"
          className="add-project-btn"
          onClick={() => {
            setAddReferralForm(true);
            setEditingReferral(null);
            setFormData({
              referraltitle: "",
              jobDescription: "",
              applyLink: "",
            });
          }}
        >
          Add Referral
        </button>
      )}

      <div className="projects-grid">
        {referrals.length === 0 ? (
          <p>No referrals found.</p>
        ) : (
          referrals.map((referral: Refferal) => (
            <div key={referral._id} className="project-card">
              <h3>{referral.referraltitle}</h3>
              <p>
                <strong>Posted By:</strong> {referral.userId}
              </p>
              <p>{referral.jobDescription}</p>
              <a
                href={referral.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="know-more-btn"
              >
                Referral Link
              </a>
              {/* Show edit and delete if the referral belongs to the current alumni */}
              {role === "alumini" && referral.userId === userId && (
                <div className="project-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReferral(referral);
                      setFormData({
                        referraltitle: referral.referraltitle,
                        jobDescription: referral.jobDescription,
                        applyLink: referral.applyLink,
                      });
                      setAddReferralForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReferral(referral._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for Add/Edit Referral */}
      {addReferralForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingReferral ? "Edit Referral" : "Add New Referral"}</h2>
            <form
              onSubmit={(e) => {
                if (editingReferral) {
                  handleEditReferral(e, editingReferral._id);
                } else {
                  handleAddReferral(e);
                }
              }}
            >
              <input
                type="text"
                name="referraltitle"
                placeholder="Referral Title"
                value={formData.referraltitle}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="jobDescription"
                placeholder="Referral Description"
                value={formData.jobDescription}
                onChange={handleInputChange}
                required
                rows={4}
              />
              <input
                type="url"
                name="applyLink"
                placeholder="Referral Link"
                value={formData.applyLink}
                onChange={handleInputChange}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  {editingReferral ? "Update Referral" : "Add Referral"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setAddReferralForm(false);
                    setEditingReferral(null);
                    setFormData({
                      referraltitle: "",
                      jobDescription: "",
                      applyLink: "",
                    });
                  }}
                >
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
