import { useRef, useCallback, useEffect, useState } from "react";

/**
 * useShootSound Hook
 *
 * Custom hook để xử lý âm thanh bắn súng trong game
 * Riêng biệt với useTypingSound để không ảnh hưởng đến nhau
 * Hỗ trợ:
 * - Phát âm thanh khi bắn và tiêu diệt kẻ địch
 * - Tắt/bật âm thanh
 * - Volume control
 * - Error handling
 */
const useShootSound = () => {
  // === REFS ===
  const audioRef = useRef(null); // Audio element cho âm thanh shoot
  const isEnabledRef = useRef(true); // Trạng thái bật/tắt âm thanh
  const audioContextUnlockedRef = useRef(false); // Đã unlock audio context chưa

  // === STATE ===
  const [audioLoaded, setAudioLoaded] = useState(false); // Trạng thái load audio
  const [audioError, setAudioError] = useState(false); // Lỗi load audio

  // === AUDIO INITIALIZATION ===
  /**
   * Khởi tạo audio element cho âm thanh shoot
   */
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      // Sử dụng file shoot.mp3 trong thư mục sounds
      const soundPath = `${process.env.PUBLIC_URL || ""}/sounds/shoot.mp3`;

      if (process.env.NODE_ENV === "development") {
        console.log("Loading shoot audio from:", soundPath);
      }

      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = 0.4; // Set volume to 40% (cao hơn một chút cho hiệu ứng bắn)
      audioRef.current.preload = "auto";

      // Success handler
      audioRef.current.addEventListener("canplaythrough", () => {
        setAudioLoaded(true);
        setAudioError(false);
        if (process.env.NODE_ENV === "development") {
          console.log("Shoot audio loaded successfully");
        }
      });

      // Error handling cho file không tồn tại
      audioRef.current.addEventListener("error", (e) => {
        setAudioError(true);
        setAudioLoaded(false);
        console.warn("Failed to load shoot audio file:", soundPath);
        if (process.env.NODE_ENV === "development") {
          console.error("Shoot audio error details:", e);
        }
      });

      // Load audio file
      audioRef.current.load();
    }
  }, []);

  // === SOUND PLAYBACK ===
  /**
   * Phát âm thanh bắn súng
   * Xử lý browser audio policy và autoplay restrictions
   */
  const playShootSound = useCallback(() => {
    if (!isEnabledRef.current || audioError || !audioLoaded) return;

    try {
      // Đảm bảo audio đã được khởi tạo
      if (!audioRef.current) {
        initAudio();
        return;
      }

      if (audioRef.current && audioRef.current.readyState >= 2) {
        // HAVE_CURRENT_DATA
        // Reset audio về đầu để có thể phát liên tục
        audioRef.current.currentTime = 0;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Đánh dấu audio context đã unlock
              audioContextUnlockedRef.current = true;
            })
            .catch((error) => {
              console.warn("Shoot audio play failed:", error);
              // Lần đầu tiên có thể chưa có user gesture
              if (!audioContextUnlockedRef.current) {
                // Thử unlock audio context với silent play
                const unlockOnNextInteraction = () => {
                  if (audioRef.current) {
                    const originalVolume = audioRef.current.volume;
                    audioRef.current.volume = 0;
                    const unlockPromise = audioRef.current.play();
                    if (unlockPromise !== undefined) {
                      unlockPromise
                        .then(() => {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          audioRef.current.volume = originalVolume;
                          audioContextUnlockedRef.current = true;
                          console.log("Shoot audio context unlocked");
                        })
                        .catch(() => {
                          audioRef.current.volume = originalVolume;
                        });
                    }
                  }
                  // Xóa listener sau khi thử unlock
                  document.removeEventListener(
                    "click",
                    unlockOnNextInteraction
                  );
                  document.removeEventListener(
                    "keydown",
                    unlockOnNextInteraction
                  );
                };

                // Listen for user interaction để unlock
                document.addEventListener("click", unlockOnNextInteraction, {
                  once: true,
                });
                document.addEventListener("keydown", unlockOnNextInteraction, {
                  once: true,
                });
              }
            });
        }
      }
    } catch (error) {
      console.warn("Error playing shoot sound:", error);
      setAudioError(true);
    }
  }, [initAudio, audioError, audioLoaded]);

  // === AUDIO INITIALIZATION ON MOUNT ===
  /**
   * Khởi tạo audio khi hook được mount
   */
  useEffect(() => {
    initAudio();
  }, [initAudio]);

  // === SOUND CONTROLS ===
  /**
   * Toggle âm thanh bắn súng bật/tắt
   */
  const toggleShootSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  /**
   * Kiểm tra trạng thái âm thanh bắn súng
   */
  const isShootSoundEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  /**
   * Set volume cho âm thanh bắn súng
   * @param {number} volume - Volume từ 0 đến 1
   */
  const setShootVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // === RETURN HOOK INTERFACE ===
  return {
    playShootSound, // Phát âm thanh bắn súng
    toggleShootSound, // Bật/tắt âm thanh bắn súng
    isShootSoundEnabled, // Kiểm tra trạng thái âm thanh
    setShootVolume, // Điều chỉnh âm lượng âm thanh bắn súng
    audioLoaded, // Trạng thái audio đã load
    audioError, // Trạng thái lỗi audio
  };
};

export default useShootSound;
