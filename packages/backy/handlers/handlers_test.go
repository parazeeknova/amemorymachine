package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupRouter() (*gin.Engine, *Handlers) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	h := New()

	r.GET("/health", h.Health)
	r.GET("/api/blogs/:slug", h.GetBlogPost)

	return r, h
}

func TestHealth(t *testing.T) {
	router, _ := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Health status = %d, want %d", w.Code, http.StatusOK)
	}

	var response map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if response["status"] != "ok" {
		t.Errorf("status = %s, want ok", response["status"])
	}
}

func TestGetBlogPost_NoDB(t *testing.T) {
	router, _ := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/blogs/crdts-101-a-primer", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("GetBlogPost status = %d, want %d (no DB available)", w.Code, http.StatusServiceUnavailable)
	}
}
