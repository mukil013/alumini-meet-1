import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import axios from "axios";
import "./style/Profile.css";
import { mainUrlPrefix } from "../main";

interface User {
  _id: string;
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
  userImg?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState<string>("");
  const [newSkill, setNewSkill] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = sessionStorage.getItem("user");
        if (!userId) throw new Error("User not authenticated");
  
        const response = await axios.get(
          `${mainUrlPrefix}/user/getUser/${userId}`
        );
  
        console.log("API Response:", response.data); 
  
        const updatedUser = response.data.userDetail;
  
        if (updatedUser.userImg && updatedUser.userImg.data) {
          console.log("Raw Buffer Data:", updatedUser.userImg.data);
  
          const blob = new Blob([new Uint8Array(updatedUser.userImg.data)], {
            type: updatedUser.userImg.contentType,
          });
  
          updatedUser.userImg = URL.createObjectURL(blob);
  
          console.log("Blob URL:", updatedUser.userImg); // ✅ Debug: Log the generated Blob URL
        }
  
        setUser(updatedUser);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);
  

  const openEditDialog = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dept: user.dept,
        bio: user.bio,
        linkedIn: user.linkedIn,
        github: user.github,
        twitter: user.twitter,
        companyName: user.companyName,
        batch: user.batch,
      });

      // Deduplicate and initialize chips
      setInterests([...new Set(user.interests)]);
      setSkills([...new Set(user.skills)]);
      setIsEditDialogOpen(true);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddInterest = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      setInterests((prev) => [...prev, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault();
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error("User not found");

      const id = user._id || sessionStorage.getItem("user")!;
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });

      data.append("interests", interests.join(","));
      data.append("skills", skills.join(","));

      if (selectedFile) data.append("userImg", selectedFile);

      // Update request
      await axios.post(`${mainUrlPrefix}/user/updateProfile/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refetch user data to ensure we have latest version
      const fetchResponse = await axios.get(
        `${mainUrlPrefix}/user/getUser/${id}`
      );

      const updatedUser = fetchResponse.data.userDetail;
      setUser(updatedUser);
      setIsEditDialogOpen(false);
      setError("");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Error updating profile");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="no-data">No user data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={
            user?.userImg ||
            "https://static.vecteezy.com/system/resources/thumbnails/036/280/651/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
          }
          alt={`logged in as ${user.role === "user" ? "student" : user.role}`}
          className="profile-img"
        />
        <h1 className="profile-name">{`${user.firstName} ${user.lastName}`}</h1>
        <p className="email-id">{user.email}</p>
        <p className="education">
          <b>Education:</b> {user.dept}, {user.batch}
        </p>
        <div className="bio">
          <b>Bio:</b> {user.bio || "No bio available"}
        </div>
        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills">
            {user.skills?.map((skill, index) => (
              <div className="skill" key={index}>
                {skill}
              </div>
            ))}
          </div>
        </div>
        <div className="social-links">
          <h3>Social Links</h3>
          <div className="links">
            {user.linkedIn && (
              <a href={user.linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {user.twitter && (
              <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            )}
          </div>
        </div>
        <div className="interests-section">
          <h3>Interests</h3>
          <div className="interests">
            {user.interests?.map((interest, index) => (
              <div className="interest" key={index}>
                {interest}
              </div>
            ))}
          </div>
        </div>
        {user.companyName && (
          <div className="company">
            <b>Company:</b> {user.companyName}
          </div>
        )}
        <button className="edit-btn" onClick={openEditDialog}>
          Edit Profile
        </button>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div
          className="dialog-overlay"
          onClick={() => setIsEditDialogOpen(false)}
        >
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="dept"
                  value={formData.dept || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="text"
                  name="linkedIn"
                  value={formData.linkedIn || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={formData.github || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Interests</label>
                <div className="chip-input">
                  <div className="chip-container">
                    {interests.map((interest, index) => (
                      <div key={index} className="chip">
                        {interest}
                        <span
                          className="close-chip"
                          onClick={() => removeInterest(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="16px"
                            viewBox="0 -960 960 960"
                            width="16px"
                            fill="royalblue"
                          >
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type interest and press Enter"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Skills</label>
                <div className="chip-input">
                  <div className="chip-container">
                    {skills.map((skill, index) => (
                      <div key={index} className="chip">
                        {skill}
                        <span
                          className="close-chip"
                          onClick={() => removeSkill(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="16px"
                            viewBox="0 -960 960 960"
                            width="16px"
                            fill="royalblue"
                          >
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                          </svg>
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="number"
                  name="batch"
                  value={formData.batch || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Profile Image (optional)</label>
                <input
                  type="file"
                  name="userImg"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button type="submit">Save Changes</button>
              <button
                type="button"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setFormData({});
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
