import { useRef, useCallback, useEffect } from "react";

const useTypingSound = () => {
  const audioRef = useRef(null);
  const isEnabledRef = useRef(true);
  const audioContextUnlockedRef = useRef(false);

  // Initialize audio
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/key_sound.wav");
      audioRef.current.volume = 0.3; // Set volume to 30%
      audioRef.current.preload = "auto";

      // Try to load audio
      audioRef.current.load();
    }
  }, []);

  // Play sound
  const playSound = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      // Ensure audio is initialized
      if (!audioRef.current) {
        initAudio();
      }

      if (audioRef.current) {
        // Reset audio to beginning
        audioRef.current.currentTime = 0;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Mark as unlocked if play succeeds
              audioContextUnlockedRef.current = true;
            })
            .catch((error) => {
              console.warn("Audio play failed:", error);
              // For first interaction, browser might still need user gesture
              if (!audioContextUnlockedRef.current) {
                // Try to unlock with silent play on next user interaction
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
                  // Remove listener after first attempt
                  document.removeEventListener(
                    "click",
                    unlockOnNextInteraction
                  );
                  document.removeEventListener(
                    "keydown",
                    unlockOnNextInteraction
                  );
                };

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

  // Initialize audio when hook is first used
  useEffect(() => {
    initAudio();
  }, [initAudio]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  // Check if sound is enabled
  const isSoundEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  // Set volume
  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playSound,
    toggleSound,
    isSoundEnabled,
    setVolume,
  };
};

export default useTypingSound;
