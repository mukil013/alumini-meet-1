import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./style/Batches.css";
import { mainUrlPrefix } from "../main";

export default function Batches() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("all"); // State for filter field selection

  // Fetch all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${mainUrlPrefix}/admin/getAllUsers`
        );
        if (response.data && response.data.users) {
          setAllUsers(response.data.users);
        } else {
          setError("No users found in the response.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Memoized filtered users for better performance
  const filteredUsers = useMemo(() => {
    if (!selectedBatch) return [];
    const batchUsers = allUsers.filter((user: any) => user.batch == selectedBatch);
    if (!searchTerm) return batchUsers;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return batchUsers.filter((user: any) => {
      // Check all fields if 'all' is selected
      if (filterField === "all") {
        return (
          (user.firstName &&
            user.firstName.toLowerCase().includes(lowerSearchTerm)) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(lowerSearchTerm)) ||
          (user.dept && user.dept.toLowerCase().includes(lowerSearchTerm)) ||
          (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) ||
          (user.phoneNumber &&
            (() => {
              return user.phoneNumber.toString() === lowerSearchTerm;
            })) ||
          (user.linkedIn &&
            user.linkedIn.toLowerCase().includes(lowerSearchTerm)) ||
          (user.twitter && user.twitter.toLowerCase().includes(lowerSearchTerm))
        );
      }

      // Check specific field if selected
      switch (filterField) {
        case "name":
          return (
            (user.firstName &&
              user.firstName.toLowerCase().includes(lowerSearchTerm)) ||
            (user.lastName &&
              user.lastName.toLowerCase().includes(lowerSearchTerm))
          );
        case "dept":
          return user.dept && user.dept.toLowerCase().includes(lowerSearchTerm);
        case "email":
          return (
            user.email && user.email.toLowerCase().includes(lowerSearchTerm)
          );
        case "phone":
          return (
            user.phoneNumber &&
            (() => {
              return user.phoneNumber.toString() === lowerSearchTerm;
            })
          );
        case "linkedin":
          return (
            user.linkedIn &&
            user.linkedIn.toLowerCase().includes(lowerSearchTerm)
          );
        case "twitter":
          return (
            user.twitter && user.twitter.toLowerCase().includes(lowerSearchTerm)
          );
        default:
          return true;
      }
    });
  }, [allUsers, selectedBatch, searchTerm, filterField]);

  const handleBatchClick = (batch: string) => {
    setSelectedBatch(batch);
    setIsDialogOpen(true);
    setSearchTerm("");
    setFilterField("all");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBatch("");
    setSearchTerm("");
    setFilterField("all");
  };

  return (
    <div className="batches-body">
      <ul id="batches">
        {[...Array(9)].map((_, index) => {
          const year = 2015 + index;
          return (
            <li key={year}>
              <button onClick={() => handleBatchClick(`${year}`)}>
                Batch of {year}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="batch-selected-year">Batch of {selectedBatch}</h2>
              <div className="search-controls">
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Fields</option>
                  <option value="name">Name</option>
                  <option value="dept">Department</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
                <input
                  type="text"
                  placeholder={`Search by ${filterField}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <p>Loading users...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : filteredUsers.length === 0 ? (
              <p>
                No users found{" "}
                {searchTerm ? "matching your search" : "for this batch"}.
              </p>
            ) : (
              <>
                <p className="result-count">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "member" : "members"} found
                </p>
                <ul className="user-list">
                  {filteredUsers.map((user: any) => (
                    <li key={user._id} className="user-item">
                      <p>
                        <strong>Name:</strong> {user.firstName} {user.lastName}
                      </p>
                      <p>
                        <strong>Department:</strong> {user.dept}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p>
                        <strong>Contact:</strong> {user.phoneNumber}
                      </p>
                      {user.linkedIn && (
                        <p>
                          <strong>LinkedIn:</strong>{" "}
                          <a
                            href={user.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.linkedIn}
                          </a>
                        </p>
                      )}
                      {user.twitter && (
                        <p>
                          <strong>Twitter:</strong>{" "}
                          <a
                            href={user.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.twitter}
                          </a>
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
