# Keyboard Architecture - Typing Game

## 🏗️ **Kiến trúc KeyboardManager mới**

### **Mục tiêu:**

- Tách biệt logic bàn phím khỏi game components
- Tập trung logic chung vào KeyboardManager
- Giữ game components đơn giản và focus vào game logic
- Đảm bảo tính nhất quán giữa các game

---

## 📊 **So sánh các kiến trúc**

### **1. Kiến trúc cũ (Direct VirtualKeyboard)**

```javascript
// Game components xử lý trực tiếp
const handleVirtualKeyPress = (key) => {
  if (key === "backspace") {
    setInputValue((prev) => prev.slice(0, -1));
    playSound();
  }
  // Logic phức tạp trong mỗi game...
};

<VirtualKeyboard onKeyPress={handleVirtualKeyPress} />;
```

**Ưu điểm:**

- ✅ Đơn giản, dễ hiểu
- ✅ Game components có full control
- ✅ Flexible cho logic đặc biệt

**Nhược điểm:**

- ❌ Duplicate logic giữa các game
- ❌ Game components phải biết về keyboard interface
- ❌ Khó maintain khi có nhiều game

### **2. Kiến trúc mới (KeyboardManager) - ✅ ĐÃ MIGRATE**

```javascript
// Game components chỉ xử lý actions
const handleKeyboardAction = (action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_CHAR:
      setInputValue((prev) => prev + action.payload);
      break;
    case ACTION_TYPES.DELETE_CHAR:
      setInputValue((prev) => prev.slice(0, -1));
      break;
    // Logic game đơn giản...
  }
};

<KeyboardManager
  gameType="wordTyper"
  gameState={gameState}
  onAction={handleKeyboardAction}
/>;
```

**Ưu điểm:**

- ✅ Logic bàn phím tập trung
- ✅ Game components đơn giản
- ✅ Consistency tuyệt đối
- ✅ Dễ thêm game mới
- ✅ Sound effects tự động

**Nhược điểm:**

- ❌ Thêm layer complexity
- ❌ Game components ít control hơn
- ❌ Cần hiểu action system

---

## 🎯 **Kiến trúc KeyboardManager**

### **Cấu trúc:**

```
Game Component
    ↓ (gameState, onAction)
KeyboardManager
    ↓ (onKeyPress)
VirtualKeyboard
    ↓ (keyboard events)
useKeyboardEvents + useKeyboardHighlight
```

### **Data Flow:**

1. **Game Component** → Cung cấp `gameState` và `onAction` callback
2. **KeyboardManager** → Tạo actions từ key presses
3. **VirtualKeyboard** → Xử lý UI và keyboard events
4. **Custom Hooks** → Highlight và sound effects

---

## 🔧 **Implementation Details**

### **Action Types:**

```javascript
const ACTION_TYPES = {
  ADD_CHAR: "ADD_CHAR", // Thêm ký tự
  DELETE_CHAR: "DELETE_CHAR", // Xóa ký tự
  SUBMIT_WORD: "SUBMIT_WORD", // Submit từ (wordTyper)
  RESTART_GAME: "RESTART_GAME", // Restart game (paragraphTyper)
  GO_BACK_CHAR: "GO_BACK_CHAR", // Quay lại ký tự trước (letterTyper)
  NO_ACTION: "NO_ACTION", // Không làm gì
};
```

### **Game State Interface:**

```javascript
const gameState = {
  isGameActive: boolean, // Game có đang active không
  inputValue: string, // Giá trị input hiện tại
  // Có thể mở rộng thêm...
};
```

### **Action Creation Logic:**

```javascript
const createAction = (gameType, key, gameState) => {
  // Logic chung cho tất cả game
  if (key === "shift") return { type: ACTION_TYPES.NO_ACTION };

  // Logic đặc biệt cho từng game
  switch (gameType) {
    case "wordTyper":
      if (key === "backspace") return { type: ACTION_TYPES.DELETE_CHAR };
      if (key === "enter")
        return { type: ACTION_TYPES.SUBMIT_WORD, payload: inputValue };
      break;
    case "letterTyper":
      if (key === "backspace") return { type: ACTION_TYPES.GO_BACK_CHAR };
      if (key === "enter") return { type: ACTION_TYPES.NO_ACTION };
      break;
    case "paragraphTyper":
      if (key === "backspace") return { type: ACTION_TYPES.DELETE_CHAR };
      if (key === "enter") return { type: ACTION_TYPES.RESTART_GAME };
      break;
  }

  // Logic chung cho ký tự
  if (key.length === 1) return { type: ACTION_TYPES.ADD_CHAR, payload: key };

  return { type: ACTION_TYPES.NO_ACTION };
};
```

---

## 📝 **Migration Status - ✅ HOÀN THÀNH**

### **Đã migrate:**

- ✅ **TypingGame.jsx** → Sử dụng KeyboardManager
- ✅ **LetterTypingGame.jsx** → Sử dụng KeyboardManager
- ✅ **ParagraphTypingGame.jsx** → Sử dụng KeyboardManager
- ✅ **KeyboardManager.jsx** → Hỗ trợ đầy đủ 3 game types

### **Migration Guide (Đã hoàn thành):**

**Bước 1: Import KeyboardManager**

```javascript
import KeyboardManager, { ACTION_TYPES } from "./KeyboardManager";
```

**Bước 2: Thay thế handleVirtualKeyPress**

```javascript
// Cũ
const handleVirtualKeyPress = (key) => {
  if (key === "backspace") {
    setInputValue((prev) => prev.slice(0, -1));
    playSound();
  }
  // ...
};

// Mới
const handleKeyboardAction = (action) => {
  switch (action.type) {
    case ACTION_TYPES.DELETE_CHAR:
      setInputValue((prev) => prev.slice(0, -1));
      break;
    // ...
  }
};
```

**Bước 3: Cập nhật JSX**

```javascript
// Cũ
<VirtualKeyboard
  onKeyPress={handleVirtualKeyPress}
  activeInput={inputValue}
  isGameActive={isGameActive}
/>

// Mới
<KeyboardManager
  gameType="wordTyper"
  gameState={{ isGameActive, inputValue }}
  onAction={handleKeyboardAction}
/>
```

---

## 🎮 **Game Type Support - ✅ HOÀN THÀNH**

### **wordTyper:**

- `enter` → Submit word
- `backspace` → Delete character
- `space` → Add space
- `char` → Add character

### **letterTyper:**

- `enter` → No action
- `backspace` → Go back one character (GO_BACK_CHAR)
- `space` → Add space
- `char` → Add character

### **paragraphTyper:**

- `enter` → Restart game
- `backspace` → Delete character
- `space` → Add space
- `char` → Add character

---

## 🚀 **Lợi ích của kiến trúc mới**

### **1. Separation of Concerns:**

- **Game Components**: Chỉ focus vào game logic
- **KeyboardManager**: Xử lý tất cả keyboard logic
- **VirtualKeyboard**: Chỉ là UI component

### **2. Consistency:**

- Tất cả game có behavior giống nhau
- Sound effects tự động
- Highlight logic nhất quán

### **3. Maintainability:**

- Logic bàn phím tập trung một chỗ
- Dễ thêm game mới
- Dễ test từng phần

### **4. Extensibility:**

- Dễ thêm action types mới
- Dễ thêm game types mới
- Dễ customize behavior

---

## 🔍 **Testing Strategy**

### **Unit Tests:**

```javascript
// Test KeyboardManager
test("should create DELETE_CHAR action for backspace", () => {
  const action = createAction("wordTyper", "backspace", { isGameActive: true });
  expect(action.type).toBe(ACTION_TYPES.DELETE_CHAR);
});

// Test Game Components
test("should handle DELETE_CHAR action", () => {
  const { result } = renderHook(() => useTypingGame());
  act(() => {
    result.current.handleKeyboardAction({ type: ACTION_TYPES.DELETE_CHAR });
  });
  expect(result.current.inputValue).toBe("");
});
```

### **Integration Tests:**

```javascript
// Test full keyboard flow
test("should handle keyboard input correctly", () => {
  render(<TypingGame />);
  fireEvent.click(screen.getByText("A"));
  expect(screen.getByDisplayValue("a")).toBeInTheDocument();
});
```

---

## 📈 **Performance Considerations**

### **Optimizations:**

1. **Memoization**: KeyboardManager có thể memoize action creation
2. **Event Delegation**: VirtualKeyboard sử dụng event delegation
3. **Lazy Loading**: Có thể lazy load KeyboardManager nếu cần

### **Memory Usage:**

- KeyboardManager: ~5KB
- Action objects: Minimal overhead
- Game state: Không thay đổi

---

## 🎯 **Kết luận**

**Kiến trúc KeyboardManager** cung cấp sự cân bằng tốt giữa:

- ✅ **Simplicity**: Game components đơn giản
- ✅ **Consistency**: Behavior nhất quán
- ✅ **Maintainability**: Dễ maintain và extend
- ✅ **Performance**: Không có overhead đáng kể

**Trạng thái: ✅ MIGRATION HOÀN THÀNH - Tất cả game components đã sử dụng KeyboardManager**

---

## 📋 **Migration Checklist - ✅ HOÀN THÀNH**

- [x] Tạo KeyboardManager component
- [x] Định nghĩa ACTION_TYPES
- [x] Implement action creation logic
- [x] Migrate TypingGame.jsx
- [x] Migrate LetterTypingGame.jsx
- [x] Migrate ParagraphTypingGame.jsx
- [x] Test tất cả game types
- [x] Cập nhật tài liệu

**🎉 TẤT CẢ GAME COMPONENTS ĐÃ ĐƯỢC MIGRATE THÀNH CÔNG!**
