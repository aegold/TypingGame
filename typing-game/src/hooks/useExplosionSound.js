import { useRef, useCallback, useEffect, useState } from "react";

/**
 * useExplosionSound Hook
 *
 * Custom hook để xử lý âm thanh nổ khi tiêu diệt kẻ địch
 * Riêng biệt với useTypingSound và useShootSound để không ảnh hưởng đến nhau
 * Hỗ trợ:
 * - Phát âm thanh khi tiêu diệt kẻ địch
 * - Tắt/bật âm thanh
 * - Volume control
 * - Error handling
 */
const useExplosionSound = () => {
  // === REFS ===
  const audioRef = useRef(null); // Audio element cho âm thanh explosion
  const isEnabledRef = useRef(true); // Trạng thái bật/tắt âm thanh
  const audioContextUnlockedRef = useRef(false); // Đã unlock audio context chưa

  // === STATE ===
  const [audioLoaded, setAudioLoaded] = useState(false); // Trạng thái load audio
  const [audioError, setAudioError] = useState(false); // Lỗi load audio

  // === AUDIO INITIALIZATION ===
  /**
   * Khởi tạo audio element cho âm thanh explosion
   */
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      // Sử dụng file explosion.mp3 trong thư mục sounds
      const soundPath = `${process.env.PUBLIC_URL || ""}/sounds/explosion.mp3`;

      if (process.env.NODE_ENV === "development") {
        console.log("Loading explosion audio from:", soundPath);
      }

      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = 0.5; // Set volume to 50% (âm thanh nổ mạnh hơn)
      audioRef.current.preload = "auto";

      // Success handler
      audioRef.current.addEventListener("canplaythrough", () => {
        setAudioLoaded(true);
        setAudioError(false);
        if (process.env.NODE_ENV === "development") {
          console.log("Explosion audio loaded successfully");
        }
      });

      // Error handling cho file không tồn tại
      audioRef.current.addEventListener("error", (e) => {
        setAudioError(true);
        setAudioLoaded(false);
        console.warn("Failed to load explosion audio file:", soundPath);
        if (process.env.NODE_ENV === "development") {
          console.error("Explosion audio error details:", e);
        }
      });

      // Load audio file
      audioRef.current.load();
    }
  }, []);

  // === SOUND PLAYBACK ===
  /**
   * Phát âm thanh nổ khi tiêu diệt kẻ địch
   * Xử lý browser audio policy và autoplay restrictions
   */
  const playExplosionSound = useCallback(() => {
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
              console.warn("Explosion audio play failed:", error);
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
                          console.log("Explosion audio context unlocked");
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
      console.warn("Error playing explosion sound:", error);
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
   * Toggle âm thanh nổ bật/tắt
   */
  const toggleExplosionSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  /**
   * Kiểm tra trạng thái âm thanh nổ
   */
  const isExplosionSoundEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  /**
   * Set volume cho âm thanh nổ
   * @param {number} volume - Volume từ 0 đến 1
   */
  const setExplosionVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // === RETURN HOOK INTERFACE ===
  return {
    playExplosionSound, // Phát âm thanh nổ
    toggleExplosionSound, // Bật/tắt âm thanh nổ
    isExplosionSoundEnabled, // Kiểm tra trạng thái âm thanh
    setExplosionVolume, // Điều chỉnh âm lượng âm thanh nổ
    audioLoaded, // Trạng thái audio đã load
    audioError, // Trạng thái lỗi audio
  };
};

export default useExplosionSound;
