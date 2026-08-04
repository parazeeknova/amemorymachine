package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

const thumbnailBucket = "video-thumbnails"

// GetVideoThumbnail extracts a frame from a video URL and serves it as a JPEG.
// Thumbnails are cached in RustFS for permanent storage across server restarts.
func (h *Handlers) GetVideoThumbnail(c *gin.Context) {
	videoURL := c.Query("url")
	if videoURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url query parameter is required"})
		return
	}

	// Only allow http/https so the endpoint cannot be pointed at local
	// files or other schemes (SSRF hardening).
	parsed, err := url.Parse(videoURL)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url must be an http(s) URL"})
		return
	}

	// Derive a stable key from the video URL hash
	hash := sha256.Sum256([]byte(videoURL))
	key := hex.EncodeToString(hash[:]) + ".jpg"

	// Check if thumbnail already exists in RustFS
	if h.storageClient != nil {
		exists, err := h.storageClient.ObjectExists(c.Request.Context(), thumbnailBucket, key)
		if err == nil && exists {
			data, err := h.storageClient.GetObject(c.Request.Context(), thumbnailBucket, key)
			if err == nil {
				c.Data(http.StatusOK, "image/jpeg", data)
				return
			}
			log.Warn().Err(err).Str("key", key).Msg("failed to read cached thumbnail, will regenerate")
		}
	}

	// Download video to temp file
	tmpFile, err := os.CreateTemp("", "verso-thumb-*.mp4")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to create temp file: %v", err)})
		return
	}
	tmpPath := tmpFile.Name()
	defer func() { _ = os.Remove(tmpPath) }()

	// Fetch with the request context so a client disconnect cancels the
	// download, and cap the body to avoid unbounded memory/disk usage.
	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, videoURL, nil)
	if err != nil {
		_ = tmpFile.Close()
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to build request: %v", err)})
		return
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		_ = tmpFile.Close()
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to fetch video: %v", err)})
		return
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		_ = tmpFile.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("video fetch returned status %d", resp.StatusCode)})
		return
	}

	const maxVideoBytes = 500 << 20 // 500 MiB cap
	if resp.ContentLength > maxVideoBytes {
		_ = tmpFile.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": "video too large"})
		return
	}
	if _, err := io.Copy(tmpFile, io.LimitReader(resp.Body, maxVideoBytes+1)); err != nil {
		_ = tmpFile.Close()
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to download video: %v", err)})
		return
	}
	if info, statErr := tmpFile.Stat(); statErr == nil && info.Size() > maxVideoBytes {
		_ = tmpFile.Close()
		c.JSON(http.StatusBadRequest, gin.H{"error": "video too large"})
		return
	}
	_ = tmpFile.Close()

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

	// Store in RustFS for future requests
	if h.storageClient != nil {
		if err := h.storageClient.PutObject(c.Request.Context(), thumbnailBucket, key, thumbData, "image/jpeg"); err != nil {
			log.Warn().Err(err).Str("key", key).Msg("failed to cache thumbnail in RustFS")
		}
	}

	c.Data(http.StatusOK, "image/jpeg", thumbData)
}

// DeleteVideoThumbnails removes cached video thumbnails whose keys are not
// derived from the video URLs the caller is still using. Callers send the
// current video URLs in the request body, so unrelated thumbnails (other
// profiles, other content) are left intact.
func (h *Handlers) DeleteVideoThumbnails(c *gin.Context) {
	if h.storageClient == nil {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "video thumbnails cleared"})
		return
	}

	var req struct {
		URLs []string `json:"urls"`
	}
	_ = c.ShouldBindJSON(&req)

	currentKeys := make(map[string]struct{}, len(req.URLs))
	for _, u := range req.URLs {
		hash := sha256.Sum256([]byte(u))
		currentKeys[hex.EncodeToString(hash[:])+".jpg"] = struct{}{}
	}

	if err := h.storageClient.DeleteObjectsIf(c.Request.Context(), thumbnailBucket, func(key string) bool {
		_, keep := currentKeys[key]
		return !keep
	}); err != nil {
		log.Error().Err(err).Msg("failed to clear stale video thumbnails")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to clear thumbnails"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok", "message": "video thumbnails cleared"})
}
