import { useRef, useCallback, useEffect } from "react";

/**
 * useTypingSound Hook
 *
 * Custom hook để xử lý âm thanh khi gõ phím
 * Hỗ trợ:
 * - Phát âm thanh khi gõ phím
 * - Tắt/bật âm thanh
 * - Xử lý audio context unlock (browser policy)
 * - Volume control
 */
const useTypingSound = () => {
  // === REFS ===
  const audioRef = useRef(null); // Audio element
  const isEnabledRef = useRef(true); // Trạng thái bật/tắt âm thanh
  const audioContextUnlockedRef = useRef(false); // Đã unlock audio context chưa

  // === AUDIO INITIALIZATION ===
  /**
   * Khởi tạo audio element
   */
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/key_sound.wav");
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.preload = "auto";

      // Load audio file
      audioRef.current.load();
    }
  }, []);

  // === SOUND PLAYBACK ===
  /**
   * Phát âm thanh gõ phím
   * Xử lý browser audio policy và autoplay restrictions
   */
  const playSound = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      // Đảm bảo audio đã được khởi tạo
      if (!audioRef.current) {
        initAudio();
      }

      if (audioRef.current) {
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
              console.warn("Audio play failed:", error);
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
                          console.log("Audio context unlocked");
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
      console.warn("Error playing sound:", error);
    }
  }, [initAudio]);

  // === AUDIO INITIALIZATION ON MOUNT ===
  /**
   * Khởi tạo audio khi hook được mount
   */
  useEffect(() => {
    initAudio();
  }, [initAudio]);

  // === SOUND CONTROLS ===
  /**
   * Toggle âm thanh bật/tắt
   */
  const toggleSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  /**
   * Kiểm tra trạng thái âm thanh
   */
  const isSoundEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  /**
   * Set volume cho âm thanh
   * @param {number} volume - Volume từ 0 đến 1
   */
  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // === RETURN HOOK INTERFACE ===
  return {
    playSound, // Phát âm thanh gõ phím
    toggleSound, // Bật/tắt âm thanh
    isSoundEnabled, // Kiểm tra trạng thái âm thanh
    setVolume, // Điều chỉnh âm lượng
  };
};

export default useTypingSound;
