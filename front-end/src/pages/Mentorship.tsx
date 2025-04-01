import axios from "axios";
import { useEffect, useState } from "react";
import "./style/Mentor.css";
import { mainUrlPrefix } from "../main";

// Helper function to convert an array of numbers to a base64 string
function arrayBufferToBase64(buffer: number[]): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

interface Group {
  _id: string;
  groupTitle: string;
  groupDescription: string;
  userId: string;
  followers: string[];
  posts: {
    _id: string;
    post: {
      title: string;
      description: string;
      image?: {
        data: number[];
        contentType: string;
      };
    };
  }[];
}

export default function Mentorship() {
  const [community, setCommunity] = useState([]);
  const [following, setFollowing] = useState([]);
  const userId = sessionStorage.getItem("user")!;
  const role = sessionStorage.getItem("role")!;
  const [currentPage, setCurrentPage] = useState("explore");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Post State
  const [showPostForm, setShowPostForm] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Group creation state
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [image] = useState<File | null>(null);
  const [postIndex, setPostIndex] = useState<number>(-1);

  async function fetchGroups() {
    try {
      let url = "";
      if (currentPage === "explore")
        url = `${mainUrlPrefix}/mentorship/getAll`;
      else if (currentPage === "yours")
        url = `${mainUrlPrefix}/mentorship/get/${userId}`;
      else if (currentPage === "following")
        url = `${mainUrlPrefix}/mentorship/followed/${userId}`;

      const response = await axios.get(url);
      if (currentPage === "following") {
        setFollowing(response.data);
      } else {
        setCommunity(response.data.mentorshipGroups);
      }
      console.log("Fetched groups:", response.data);
    } catch (e) {
      console.error("Error fetching mentorship groups:", e);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, [currentPage]);

  const toggleFollow = async (groupId: string) => {
    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/follow/${groupId}/${userId}`
      );
      fetchGroups();
    } catch (error) {
      console.error("Error following/unfollowing group:", error);
    }
  };

  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("groupTitle", groupTitle);
    formData.append("groupDescription", groupDescription);
    if (image) formData.append("image", image);

    try {
      await axios.post(`${mainUrlPrefix}/mentorship/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddForm(false);
      fetchGroups();
    } catch (error) {
      console.error("Error adding mentorship group:", error);
    }
  };

  const handleAddPost = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    if (postImage) {
      // Append file with field name "file" as expected by multer
      formData.append("file", postImage);
    }

    try {
      await axios.post(
      `${mainUrlPrefix}/mentorship/${groupId}/addPost`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowPostForm(false);
      setPostTitle("");
      setPostDescription("");
      setPostImage(null);
      fetchGroups();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleEditPost = async (e: React.FormEvent, groupId: string, postIndex: number) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("description", postDescription);
    if (postImage) {
      formData.append("file", postImage);
    }

    try {
      await axios.post(
        `${mainUrlPrefix}/mentorship/${groupId}/updatePost/${postIndex}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowPostForm(false);
      setPostTitle("");
      setPostDescription("");
      setPostImage(null);
      fetchGroups();
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const handleDeletePost = async (postIndex: string, groupId: string) => {
    try {
      await axios.delete(
        `${mainUrlPrefix}/mentorship/${groupId}/deletePost/${postIndex}`
      );
      fetchGroups();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Handle file changes for post image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPostImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      console.log("Selected Group:", selectedGroup);
    }
  }, [selectedGroup]);

  return (
    <div className="mentor-body">
      <div className="tabs">
        <button
          className={`tab ${currentPage === "explore" ? "active" : ""}`}
          onClick={() => setCurrentPage("explore")}
        >
          Explore
        </button>
        <button
          className={`tab ${currentPage === "following" ? "active" : ""}`}
          onClick={() => setCurrentPage("following")}
        >
          Following
        </button>
        {role === "alumini" && (
          <button
            className={`tab ${currentPage === "yours" ? "active" : ""}`}
            onClick={() => setCurrentPage("yours")}
          >
            Yours
          </button>
        )}
      </div>

      {/* Explore Section */}
      {currentPage === "explore" && (
        <div className="mentor-content-page">
          {community.length > 0 ? (
            community.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
                title={group.groupTitle}
              >
                <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p><strong>Followers : </strong>{group.followers.length}</p>
                </div>
                <button
                  className="follow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(group._id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                    className={
                      group.followers.includes(userId)
                        ? "svgFollow"
                        : "svgUnfollow"
                    }
                  >
                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p>No mentorship groups found.</p>
          )}
        </div>
      )}

      {/* Following Section */}
      {currentPage === "following" && (
        <div className="mentor-content-page">
          {following.length > 0 ? (
            following.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
                title={group.groupTitle}
              >
                 <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p><strong>Followers : </strong>{group.followers.length}</p>
                </div>
                <button
                  className="follow-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(group._id);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#fff"
                    className={
                      group.followers.includes(userId)
                        ? "svgFollow"
                        : "svgUnfollow"
                    }
                  >
                    <path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <p>You are not following any mentorship groups.</p>
          )}
        </div>
      )}

      {/* Yours Section */}
      {currentPage === "yours" && (
        <div className="mentor-content-page">
          {role === "alumini" && (
            <button
              onClick={() => setShowAddForm(true)}
              className="add-community"
            >
              Add Community
            </button>
          )}
          {showAddForm && (
            <dialog open={showAddForm} className="dialog-box">
              <form
                onSubmit={handleAddCommunity}
                className="add-community-form"
              >
                <h3>Create a Mentorship Group</h3>
                <input
                  type="text"
                  placeholder="Group Title"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Group Description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  required
                ></textarea>
                <button type="submit">Add Group</button>
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </form>
            </dialog>
          )}
          {community.length > 0 ? (
            community.map((group: Group) => (
              <div
                key={group._id}
                className="mentorship-card"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="nameHolder">
                  <h2>{group.groupTitle}</h2>
                  <p>{group.groupDescription}</p>
                  <p><strong>Followers : </strong>{group.followers.length}</p>
                </div>
              </div>
            ))
          ) : (
            <p>You have no mentorship groups yet.</p>
          )}
        </div>
      )}

      {/* Expanded Group View */}
      {selectedGroup && (
        <div className="dialog-overlay" onClick={() => setSelectedGroup(null)}>
          <dialog
            className="mentor-dialog-box"
            open={true}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2>{selectedGroup.groupTitle}</h2>
              <p>{selectedGroup.groupDescription}</p>
            </div>

            <h3>Posts</h3>
            {role === "alumini" && selectedGroup.userId === userId && (
              <button onClick={() => setShowPostForm(true)}>+ Add Post</button>
            )}
            {selectedGroup.posts && selectedGroup.posts.length > 0 ? (
              selectedGroup.posts.map((post: any, index: number) => (
                <div key={post._id} className="post-card">
                  <h3>{post.post.title}</h3>
                  <p>{post.post.description}</p>
                  {post.post.image && post.post.image.data && (
                    <img
                      src={`data:${post.post.image.contentType};base64,${arrayBufferToBase64(
                        post.post.image.data.data
                      )}`}
                      alt="Post"
                      style={{ width: "100px", height: "100px" }}
                    />
                  )}
                  {role === "alumini" && selectedGroup.userId === userId && (
                    <>
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setPostTitle(post.post.title);
                          setPostDescription(post.post.description);
                          setShowPostForm(true);
                          setPostIndex(index)
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeletePost(post._id, selectedGroup._id)
                        }
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )}
          </dialog>
        </div>
      )}

      {/* Add/Edit Post Modal */}
      {showPostForm && (
        <dialog open={showPostForm}>
          <form
            onSubmit={
              editingPost
                ? (e) => handleEditPost(e, selectedGroup!._id, postIndex)
                : (e) => handleAddPost(e, selectedGroup!._id)
            }
            className="post-form"
          >
            <h3>{editingPost ? "Edit Post" : "Add Post"}</h3>
            <input
              type="text"
              placeholder="Post Title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Post Description"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
              required
            ></textarea>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button type="submit">
              {editingPost ? "Update Post" : "Add Post"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPostForm(false);
                setEditingPost(null);
              }}
            >
              Cancel
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
