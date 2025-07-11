import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Thêm state cho category management
  const [activeTab, setActiveTab] = useState("lessons");
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
    color: "#888888",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    words: "",
    gameType: "letterTyper",
    timer: 30,
    category: "",
    order: 0,
  });

  // Kiểm tra quyền admin khi component mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Gọi API kiểm tra quyền admin
        await axios.get("/api/admin/check");
        setIsAdmin(true);
        setCheckingAuth(false);
      } catch (err) {
        console.error("Admin auth check failed:", err);
        // Nếu không phải admin hoặc token không hợp lệ, redirect về lessons
        navigate("/lessons");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Chỉ load data khi đã xác nhận là admin
  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchLessons();
    }
  }, [isAdmin]);

  // Thêm hàm fetchCategories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      setError("Không thể tải danh sách category");
      console.error("Fetch categories error:", err);
    }
  };

  // Thêm hàm xử lý category
  const handleCategoryInput = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, categoryForm);
      } else {
        await axios.post("/api/categories", categoryForm);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        order: 0,
        color: "#888888",
      });
      fetchCategories();
    } catch (err) {
      setError("Có lỗi khi lưu category");
      console.error("Save category error:", err);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      order: category.order || 0,
      color: category.color || "#888888",
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa category này?")) {
      try {
        await axios.delete(`/api/categories/${category._id}`);
        fetchCategories();
      } catch (err) {
        setError("Không thể xóa category (có thể còn bài học liên quan)");
        console.error("Delete category error:", err);
      }
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/lessons");
      setLessons(response.data);
    } catch (err) {
      setError("Không thể tải danh sách bài học");
      console.error("Fetch lessons error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseWords = (wordsString) => {
    try {
      let parsed = JSON.parse(wordsString);
      if (formData.gameType === "letterTyper") {
        // Nếu là mảng 1 chiều, bọc lại thành mảng 2 chiều
        if (Array.isArray(parsed) && typeof parsed[0] === "string") {
          parsed = [parsed];
        }
      } else if (formData.gameType === "vietnameseLetterTyper") {
        // Vietnamese characters should be an array of single characters
        if (Array.isArray(parsed) && typeof parsed[0] === "string") {
          return parsed;
        }
      }
      return parsed;
    } catch {
      // Nếu không phải JSON, chia theo dòng
      let arr = wordsString.split("\n").filter((word) => word.trim());
      if (formData.gameType === "letterTyper") {
        arr = [arr];
      } else if (formData.gameType === "vietnameseLetterTyper") {
        // For Vietnamese, each line should be a single character
        return arr;
      }
      return arr;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        ...formData,
        words: parseWords(formData.words),
        timer: parseInt(formData.timer),
      };

      if (editingLesson) {
        await axios.put(`/api/lessons/${editingLesson._id}`, lessonData);
      } else {
        await axios.post("/api/lessons", lessonData);
      }

      setShowCreateForm(false);
      setEditingLesson(null);
      resetForm();
      fetchLessons();
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu bài học");
      console.error("Save lesson error:", err);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      videoUrl: lesson.videoUrl || "",
      words: Array.isArray(lesson.words)
        ? JSON.stringify(lesson.words, null, 2)
        : lesson.words,
      gameType: lesson.gameType,
      timer: lesson.timer,
      category: lesson.category || "",
      order: lesson.order || 0,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await axios.delete(`/api/lessons/${lessonId}`);
        fetchLessons();
      } catch (err) {
        setError("Có lỗi xảy ra khi xóa bài học");
        console.error("Delete lesson error:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      videoUrl: "",
      words: "",
      gameType: "letterTyper",
      timer: 30,
      category: "",
      order: 0,
    });
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingLesson(null);
    resetForm();
  };

  const getGameTypeLabel = (gameType) => {
    const labels = {
      letterTyper: "Gõ chữ cái",
      wordTyper: "Gõ từ",
      paragraphTyper: "Gõ đoạn văn",
      vietnameseLetterTyper: "Gõ ký tự tiếng Việt",
    };
    return labels[gameType] || gameType;
  };

  const getContentPlaceholder = (gameType) => {
    const placeholders = {
      letterTyper:
        'Nhập các chữ cái, mỗi chữ một dòng:\na\nb\nc\nd\n\nHoặc nhập dạng JSON: ["a", "b", "c", "d"]',
      wordTyper:
        'Nhập các từ, mỗi từ một dòng:\ncat\ndog\nhouse\nbook\n\nHoặc nhập dạng JSON: ["cat", "dog", "house", "book"]',
      paragraphTyper:
        "Nhập đoạn văn bản hoàn chỉnh:\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      vietnameseLetterTyper:
        'Nhập các ký tự tiếng Việt, mỗi ký tự một dòng:\ná\nà\nả\nã\nạ\nâ\nấ\nầ\n\nHoặc nhập dạng JSON: ["á", "à", "ả", "ã", "ạ"]',
    };
    return placeholders[gameType] || "";
  };

  const getContentLabel = (gameType) => {
    const labels = {
      letterTyper: "Chữ cái cần gõ:",
      wordTyper: "Từ cần gõ:",
      paragraphTyper: "Đoạn văn cần gõ:",
      vietnameseLetterTyper: "Ký tự tiếng Việt cần học:",
    };
    return labels[gameType] || "Nội dung:";
  };

  if (checkingAuth) {
    return (
      <div className="admin-dashboard">Đang kiểm tra quyền truy cập...</div>
    );
  }

  if (!isAdmin) {
    return <div className="admin-dashboard">Không có quyền truy cập.</div>;
  }

  if (loading) {
    return <div className="admin-dashboard">Đang tải...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Quản trị</h1>
        <div className="tab-nav">
          <button
            className={activeTab === "lessons" ? "active" : ""}
            onClick={() => setActiveTab("lessons")}
          >
            Quản lý Lessons
          </button>
          <button
            className={activeTab === "categories" ? "active" : ""}
            onClick={() => setActiveTab("categories")}
          >
            Quản lý Categories
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tab Categories */}
      {activeTab === "categories" && (
        <div className="categories-tab">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryForm({
                name: "",
                description: "",
                order: 0,
                color: "#888888",
              });
            }}
          >
            Tạo category mới
          </button>

          {showCategoryForm && (
            <div className="form-overlay">
              <div className="form-container">
                <h2>
                  {editingCategory ? "Chỉnh sửa category" : "Tạo category mới"}
                </h2>
                <form onSubmit={handleCategorySubmit}>
                  <div className="form-group">
                    <label>Tên category:</label>
                    <input
                      type="text"
                      name="name"
                      value={categoryForm.name}
                      onChange={handleCategoryInput}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả:</label>
                    <textarea
                      name="description"
                      value={categoryForm.description}
                      onChange={handleCategoryInput}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thứ tự (order):</label>
                    <input
                      type="number"
                      name="order"
                      value={categoryForm.order}
                      onChange={handleCategoryInput}
                      min="0"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? "Cập nhật" : "Tạo"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="categories-grid">
            {categories.length === 0 ? (
              <p>Chưa có category nào.</p>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="category-card">
                  <div className="category-header">
                    <h3>{category.name}</h3>
                    <span className="category-order">#{category.order}</span>
                  </div>
                  <div className="category-desc">{category.description}</div>
                  <div className="category-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEditCategory(category)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Lessons */}
      {activeTab === "lessons" && (
        <>
          <div className="lesson-filter">
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Tạo bài học mới
            </button>
          </div>

          {/* Form create lesson */}
          {showCreateForm && (
            <div className="form-overlay">
              <div className="form-container">
                <h2>
                  {editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>URL Video (tùy chọn):</label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Loại game:</label>
                    <select
                      name="gameType"
                      value={formData.gameType}
                      onChange={handleInputChange}
                    >
                      <option value="letterTyper">Gõ chữ cái</option>
                      <option value="wordTyper">Gõ từ</option>
                      <option value="paragraphTyper">Gõ đoạn văn</option>
                      <option value="vietnameseLetterTyper">
                        Gõ ký tự tiếng Việt
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Thời gian (giây):</label>
                    <input
                      type="number"
                      name="timer"
                      value={formData.timer}
                      onChange={handleInputChange}
                      min="1"
                      max="600"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Thứ tự (order):</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>{getContentLabel(formData.gameType)}</label>
                    <textarea
                      name="words"
                      value={formData.words}
                      onChange={handleInputChange}
                      rows={formData.gameType === "paragraphTyper" ? "8" : "12"}
                      placeholder={getContentPlaceholder(formData.gameType)}
                      required
                    />
                    <div className="form-help">
                      {formData.gameType === "letterTyper" && (
                        <p>
                          Nhập các chữ cái riêng lẻ, mỗi chữ một dòng hoặc dạng
                          JSON array.
                        </p>
                      )}
                      {formData.gameType === "wordTyper" && (
                        <p>
                          Nhập các từ riêng lẻ, mỗi từ một dòng hoặc dạng JSON
                          array.
                        </p>
                      )}
                      {formData.gameType === "paragraphTyper" && (
                        <p>
                          Nhập một đoạn văn bản hoàn chỉnh để người dùng gõ
                          theo.
                        </p>
                      )}
                      {formData.gameType === "vietnameseLetterTyper" && (
                        <p>
                          Nhập các ký tự tiếng Việt có dấu, mỗi ký tự một dòng.
                          Ví dụ: á, à, ả, ã, ạ, â, ấ, ầ, ă, ắ, ằ, đ, v.v. Người
                          dùng sẽ học cách gõ Telex để tạo ra các ký tự này.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingLesson ? "Cập nhật" : "Tạo"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cancelEdit}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List lessons */}
          <div className="lessons-list">
            {lessons.length === 0 ? (
              <p>Chưa có bài học nào.</p>
            ) : (
              <div className="lessons-grid">
                {lessons
                  .sort((a, b) => {
                    // Sort theo category order, lesson order
                    const catA = categories.find(
                      (c) => c._id === a.category
                    ) || { order: 9999 };
                    const catB = categories.find(
                      (c) => c._id === b.category
                    ) || { order: 9999 };
                    if (catA.order !== catB.order)
                      return catA.order - catB.order;
                    return (a.order || 0) - (b.order || 0);
                  })
                  .map((lesson) => (
                    <div key={lesson._id} className="lesson-card">
                      <div className="lesson-header">
                        <h3>{lesson.title}</h3>
                        <div className="lesson-type">
                          {getGameTypeLabel(lesson.gameType)}
                        </div>
                      </div>
                      <div className="lesson-details">
                        <p>
                          <strong>Thời gian:</strong> {lesson.timer}s
                        </p>
                        <p>
                          <strong>Số từ/ký tự:</strong>{" "}
                          {Array.isArray(lesson.words)
                            ? lesson.words.length
                            : 1}
                        </p>
                        <p>
                          <strong>Category:</strong>{" "}
                          {categories.find((c) => c._id === lesson.category)
                            ?.name || "Chưa phân loại"}
                        </p>
                        {lesson.videoUrl && (
                          <p>
                            <strong>Video:</strong>{" "}
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Xem
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="lesson-actions">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(lesson)}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(lesson._id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
