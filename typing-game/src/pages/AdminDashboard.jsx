import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

/**
 * AdminDashboard Component
 * Trang quản trị cho admin để quản lý lessons và categories
 * Chỉ có thể truy cập bởi users có quyền admin
 */
const AdminDashboard = () => {
  const navigate = useNavigate();

  // === LESSON MANAGEMENT STATE ===
  const [lessons, setLessons] = useState([]); // Danh sách tất cả bài học
  const [loading, setLoading] = useState(true); // Trạng thái loading khi fetch data
  const [error, setError] = useState(""); // Thông báo lỗi
  const [showCreateForm, setShowCreateForm] = useState(false); // Hiển thị form tạo/sửa lesson
  const [editingLesson, setEditingLesson] = useState(null); // Lesson đang được edit (null = create mode)

  // === AUTHENTICATION STATE ===
  const [isAdmin, setIsAdmin] = useState(false); // Kiểm tra user có phải admin
  const [checkingAuth, setCheckingAuth] = useState(true); // Đang kiểm tra quyền admin

  // === CATEGORY MANAGEMENT STATE ===
  const [activeTab, setActiveTab] = useState("lessons"); // Tab đang active (lessons/categories)
  const [categories, setCategories] = useState([]); // Danh sách tất cả categories
  const [showCategoryForm, setShowCategoryForm] = useState(false); // Hiển thị form tạo/sửa category
  const [editingCategory, setEditingCategory] = useState(null); // Category đang được edit
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    order: 0,
    color: "#888888",
  }); // Form data cho category

  // === LESSON FORM STATE ===
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    words: "",
    gameType: "letterTyper",
    timer: 30,
    category: "",
    order: 0,
  }); // Form data cho lesson

  // === AUTHENTICATION EFFECTS ===
  /**
   * Kiểm tra quyền admin khi component mount
   * Redirect về login nếu không có token
   * Redirect về lessons nếu không phải admin
   */
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

  /**
   * Load data khi đã xác nhận là admin
   * Fetch categories và lessons sau khi authentication thành công
   */
  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchLessons();
    }
  }, [isAdmin]);

  // === CATEGORY MANAGEMENT FUNCTIONS ===
  /**
   * Fetch danh sách categories từ API
   */
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      setError("Không thể tải danh sách category");
      console.error("Fetch categories error:", err);
    }
  };

  /**
   * Xử lý thay đổi input trong category form
   */
  const handleCategoryInput = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Submit category form (tạo mới hoặc cập nhật)
   */
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(`/api/categories/${editingCategory._id}`, categoryForm);
      } else {
        // Create new category
        await axios.post("/api/categories", categoryForm);
      }
      // Reset form và refresh data
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

  /**
   * Bắt đầu edit category - populate form với data hiện tại
   */
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

  /**
   * Xóa category với confirmation
   * Backend sẽ kiểm tra nếu còn lesson liên quan
   */
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

  // === LESSON MANAGEMENT FUNCTIONS ===
  /**
   * Fetch danh sách lessons từ API
   */
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

  /**
   * Xử lý thay đổi input trong lesson form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Parse words string thành format phù hợp với từng game type
   * Hỗ trợ cả JSON array và text lines
   */
  const parseWords = (wordsString) => {
    try {
      // Thử parse JSON trước
      let parsed = JSON.parse(wordsString);
      if (formData.gameType === "letterTyper") {
        // Nếu là mảng 1 chiều, bọc lại thành mảng 2 chiều cho sequences
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
        arr = [arr]; // Wrap in array for sequences
      } else if (formData.gameType === "vietnameseLetterTyper") {
        // For Vietnamese, each line should be a single character
        return arr;
      }
      return arr;
    }
  };

  /**
   * Submit lesson form (tạo mới hoặc cập nhật)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        ...formData,
        words: parseWords(formData.words),
        timer: parseInt(formData.timer),
      };

      if (editingLesson) {
        // Update existing lesson
        await axios.put(`/api/lessons/${editingLesson._id}`, lessonData);
      } else {
        // Create new lesson
        await axios.post("/api/lessons", lessonData);
      }

      // Reset form và refresh data
      setShowCreateForm(false);
      setEditingLesson(null);
      resetForm();
      fetchLessons();
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu bài học");
      console.error("Save lesson error:", err);
    }
  };

  /**
   * Bắt đầu edit lesson - populate form với data hiện tại
   */
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

  /**
   * Xóa lesson với confirmation
   */
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

  /**
   * Reset lesson form về trạng thái ban đầu
   */
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

  /**
   * Hủy edit mode và reset form
   */
  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingLesson(null);
    resetForm();
  };

  // === UTILITY FUNCTIONS ===
  /**
   * Chuyển đổi gameType thành label hiển thị
   */
  const getGameTypeLabel = (gameType) => {
    const labels = {
      letterTyper: "Gõ chữ cái",
      wordTyper: "Gõ từ",
      paragraphTyper: "Gõ đoạn văn",
      vietnameseLetterTyper: "Gõ ký tự tiếng Việt",
    };
    return labels[gameType] || gameType;
  };

  /**
   * Lấy placeholder text cho textarea words dựa vào gameType
   */
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

  /**
   * Lấy label cho trường words dựa vào gameType
   */
  const getContentLabel = (gameType) => {
    const labels = {
      letterTyper: "Chữ cái cần gõ:",
      wordTyper: "Từ cần gõ:",
      paragraphTyper: "Đoạn văn cần gõ:",
      vietnameseLetterTyper: "Ký tự tiếng Việt cần học:",
    };
    return labels[gameType] || "Nội dung:";
  };

  // === RENDER CONDITIONS ===
  // Hiển thị loading khi đang kiểm tra authentication
  if (checkingAuth) {
    return (
      <div className="page-content">
        <div className="admin-dashboard">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có quyền admin
  if (!isAdmin) {
    return (
      <div className="page-content">
        <div className="admin-dashboard">Không có quyền truy cập.</div>
      </div>
    );
  }

  // Hiển thị loading khi đang fetch data
  if (loading) {
    return (
      <div className="page-content">
        <div className="admin-dashboard">Đang tải...</div>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div className="page-content no-padding">
      <div className="admin-dashboard">
        {/* Header với navigation tabs */}
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

        {/* Hiển thị error message nếu có */}
        {error && <div className="error-message">{error}</div>}

        {/* === TAB CATEGORIES === */}
        {activeTab === "categories" && (
          <div className="categories-tab">
            {/* Button tạo category mới */}
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

            {/* Form tạo/sửa category */}
            {showCategoryForm && (
              <div className="form-overlay">
                <div className="form-container">
                  <h2>
                    {editingCategory
                      ? "Chỉnh sửa category"
                      : "Tạo category mới"}
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

            {/* Grid hiển thị danh sách categories */}
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

        {/* === TAB LESSONS === */}
        {activeTab === "lessons" && (
          <>
            {/* Button tạo lesson mới */}
            <div className="lesson-filter">
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Tạo bài học mới
              </button>
            </div>

            {/* Form tạo/sửa lesson */}
            {showCreateForm && (
              <div className="form-overlay">
                <div className="form-container">
                  <h2>
                    {editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
                  </h2>
                  <form onSubmit={handleSubmit}>
                    {/* Tiêu đề lesson */}
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

                    {/* URL video hướng dẫn (optional) */}
                    <div className="form-group">
                      <label>URL Video (tùy chọn):</label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Loại game */}
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

                    {/* Thời gian game */}
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

                    {/* Category selection */}
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

                    {/* Thứ tự lesson trong category */}
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

                    {/* Nội dung words - thay đổi theo gameType */}
                    <div className="form-group">
                      <label>{getContentLabel(formData.gameType)}</label>
                      <textarea
                        name="words"
                        value={formData.words}
                        onChange={handleInputChange}
                        rows={
                          formData.gameType === "paragraphTyper" ? "8" : "12"
                        }
                        placeholder={getContentPlaceholder(formData.gameType)}
                        required
                      />
                      {/* Help text cho từng loại game */}
                      <div className="form-help">
                        {formData.gameType === "letterTyper" && (
                          <p>
                            Nhập các chữ cái riêng lẻ, mỗi chữ một dòng hoặc
                            dạng JSON array.
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
                            Nhập các ký tự tiếng Việt có dấu, mỗi ký tự một
                            dòng. Ví dụ: á, à, ả, ã, ạ, â, ấ, ầ, ă, ắ, ằ, đ,
                            v.v. Người dùng sẽ học cách gõ Telex để tạo ra các
                            ký tự này.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form actions */}
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

            {/* Grid hiển thị danh sách lessons */}
            <div className="admin-lessons-list">
              {lessons.length === 0 ? (
                <p>Chưa có bài học nào.</p>
              ) : (
                <div className="admin-lessons-grid">
                  {lessons
                    .sort((a, b) => {
                      // Sort theo category order, rồi lesson order
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
                      <div key={lesson._id} className="admin-lesson-card">
                        {/* Header với title và game type */}
                        <div className="admin-lesson-header">
                          <h3>{lesson.title}</h3>
                          <div className="admin-lesson-type">
                            {getGameTypeLabel(lesson.gameType)}
                          </div>
                        </div>

                        {/* Chi tiết lesson */}
                        <div className="admin-lesson-details">
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

                        {/* Actions cho lesson */}
                        <div className="admin-lesson-actions">
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
    </div>
  );
};

export default AdminDashboard;
