package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"sync"

	"github.com/gin-gonic/gin"
)

type videoThumbnailCache struct {
	mu    sync.RWMutex
	items map[string][]byte
}

var thumbnailCache = &videoThumbnailCache{
	items: make(map[string][]byte),
}

func (c *videoThumbnailCache) get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	data, ok := c.items[key]
	return data, ok
}

func (c *videoThumbnailCache) set(key string, data []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = data
}

func (h *Handlers) GetVideoThumbnail(c *gin.Context) {
	videoURL := c.Query("url")
	if videoURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query parameter is required"})
		return
	}

	// Check in-memory cache first
	if cached, ok := thumbnailCache.get(videoURL); ok {
		c.Data(http.StatusOK, "image/jpeg", cached)
		return
	}

	// Download video to temp file
	tmpFile, err := os.CreateTemp("", "verso-thumb-*.mp4")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to create temp file: %v", err)})
		return
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	resp, err := http.Get(videoURL)
	if err != nil {
		tmpFile.Close()
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch video: %v", err)})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		tmpFile.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("video fetch returned status %d", resp.StatusCode)})
		return
	}

	if _, err := io.Copy(tmpFile, resp.Body); err != nil {
		tmpFile.Close()
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to download video: %v", err)})
		return
	}
	tmpFile.Close()

	// Extract thumbnail frame at 1 second using ffmpeg, pipe JPEG to stdout
	cmd := exec.Command("ffmpeg",
		"-i", tmpPath,
		"-ss", "00:00:01",
		"-vframes", "1",
		"-f", "image2pipe",
		"-c:v", "mjpeg",
		"-q:v", "5",
		"-loglevel", "error",
		"pipe:1",
	)

	thumbData, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to extract thumbnail: %v", err)})
		return
	}

	// Cache the result
	thumbnailCache.set(videoURL, thumbData)

	c.Data(http.StatusOK, "image/jpeg", thumbData)
}
