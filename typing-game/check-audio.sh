#!/bin/bash

# Script to check audio file existence before build
echo "Audio Configuration Check"
echo "========================="

echo "Checking audio files..."

# Check if public/sounds directory exists
if [ -d "public/sounds" ]; then
    echo "[OK] public/sounds directory exists"
    
    # Check if key_sound.wav exists
    if [ -f "public/sounds/key_sound.wav" ]; then
        echo "[OK] key_sound.wav exists"
        
        # Get file size
        file_size=$(stat -f%z "public/sounds/key_sound.wav" 2>/dev/null || stat -c%s "public/sounds/key_sound.wav" 2>/dev/null)
        echo "    File size: ${file_size:-unknown} bytes"
        
        # Check if file is not empty
        if [ "$file_size" -gt 0 ] 2>/dev/null; then
            echo "[OK] Audio file is not empty"
        else
            echo "[WARNING] Audio file might be empty"
        fi
    else
        echo "[ERROR] key_sound.wav not found in public/sounds/"
        echo "Please ensure the audio file exists before building"
        exit 1
    fi
else
    echo "[ERROR] public/sounds directory not found"
    echo "Creating directory and copying audio file..."
    mkdir -p public/sounds
    echo "Please add key_sound.wav to public/sounds/ directory"
    exit 1
fi

# Check PUBLIC_URL setting
echo ""
echo "Checking PUBLIC_URL configuration..."
if [ -f ".env.production" ]; then
    public_url=$(grep "REACT_APP_PUBLIC_URL" .env.production | cut -d '=' -f2)
    if [ -n "$public_url" ]; then
        echo "[INFO] PUBLIC_URL will be: $public_url"
        echo "Audio path will be: ${public_url}/sounds/key_sound.wav"
    else
        echo "[INFO] No custom PUBLIC_URL set, using homepage from package.json"
    fi
else
    echo "[INFO] No .env.production file, using default settings"
fi

echo ""
echo "Audio check completed successfully!"
echo "You can now run 'npm run build' safely."
