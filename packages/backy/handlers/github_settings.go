package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"net/http"
	"os"
	"time"

	"verso/backy/database"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/nacl/secretbox"
)

func deriveKey() *[32]byte {
	secret := os.Getenv("ENCRYPTION_SECRET")
	if secret == "" {
		secret = "verso-dev-encryption-key-change-me"
	}
	hash := sha256.Sum256([]byte(secret))
	var key [32]byte
	copy(key[:], hash[:])
	return &key
}

func encryptToken(plaintext string) ([]byte, error) {
	key := deriveKey()
	var nonce [24]byte
	if _, err := rand.Read(nonce[:]); err != nil {
		return nil, err
	}
	return secretbox.Seal(nonce[:], []byte(plaintext), &nonce, key), nil
}

func decryptToken(encrypted []byte) (string, error) {
	key := deriveKey()
	var nonce [24]byte
	copy(nonce[:], encrypted[:24])
	decrypted, ok := secretbox.Open(nil, encrypted[24:], &nonce, key)
	if !ok {
		return "", os.ErrInvalid
	}
	return string(decrypted), nil
}

type GitHubSettings struct {
	Enabled        bool    `json:"enabled"`
	Username       string  `json:"username"`
	HasToken       bool    `json:"hasToken"`
	TokenUpdatedAt *string `json:"tokenUpdatedAt,omitempty"`
}

func (h *Handlers) GetGitHubSettings(c *gin.Context) {
	pool := database.PoolAvailable()
	var enabled bool
	var username string
	var tokenEncrypted []byte
	var tokenUpdatedAt *time.Time

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username, token_encrypted, token_updated_at FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled, &username, &tokenEncrypted, &tokenUpdatedAt)
	if err != nil {
		c.JSON(http.StatusOK, GitHubSettings{Enabled: true, Username: "parazeeknova"})
		return
	}

	var tokenUpdatedAtStr *string
	if tokenUpdatedAt != nil {
		s := tokenUpdatedAt.Format(time.RFC3339)
		tokenUpdatedAtStr = &s
	}

	c.JSON(http.StatusOK, GitHubSettings{
		Enabled:        enabled,
		Username:       username,
		HasToken:       len(tokenEncrypted) > 0,
		TokenUpdatedAt: tokenUpdatedAtStr,
	})
}

type updateGitHubSettingsRequest struct {
	Enabled  *bool   `json:"enabled,omitempty"`
	Username *string `json:"username,omitempty"`
	Token    *string `json:"token,omitempty"`
}

func (h *Handlers) UpdateGitHubSettings(c *gin.Context) {
	pool := database.PoolAvailable()
	if pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}

	var req updateGitHubSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var currentEnabled bool
	var currentUsername string
	var currentTokenEncrypted []byte

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username, token_encrypted FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&currentEnabled, &currentUsername, &currentTokenEncrypted)
	if err != nil {
		_, err = pool.Exec(c.Request.Context(),
			`INSERT INTO github_settings (enabled, username) VALUES (true, 'parazeeknova')`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to init settings"})
			return
		}
		currentEnabled = true
		currentUsername = "parazeeknova"
	}

	enabled := currentEnabled
	username := currentUsername
	var tokenBytes []byte = currentTokenEncrypted

	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	if req.Username != nil {
		username = *req.Username
	}

	var tokenChanged bool
	if req.Token != nil {
		tokenChanged = true
		if *req.Token == "" {
			tokenBytes = nil
		} else {
			encrypted, encErr := encryptToken(*req.Token)
			if encErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encrypt token"})
				return
			}
			tokenBytes = encrypted
		}
	}

	var tokenUpdatedAtSQL string
	if tokenChanged {
		tokenUpdatedAtSQL = ", token_updated_at = NOW()"
	}

	_, err = pool.Exec(c.Request.Context(),
		`UPDATE github_settings SET enabled = $1, username = $2, token_encrypted = $3, updated_at = NOW()`+tokenUpdatedAtSQL,
		enabled, username, tokenBytes,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	if h.statsCache != nil {
		h.statsCache.Clear()
	}

	var updatedAt *time.Time
	var updatedAtStr *string
	if tokenChanged {
		_ = pool.QueryRow(c.Request.Context(),
			`SELECT token_updated_at FROM github_settings ORDER BY created_at LIMIT 1`,
		).Scan(&updatedAt)
		if updatedAt != nil {
			s := updatedAt.Format(time.RFC3339)
			updatedAtStr = &s
		}
	}

	c.JSON(http.StatusOK, GitHubSettings{
		Enabled:        enabled,
		Username:       username,
		HasToken:       len(tokenBytes) > 0,
		TokenUpdatedAt: updatedAtStr,
	})
}

func (h *Handlers) GetGitHubEnabledStatus(c *gin.Context) {
	pool := database.PoolAvailable()
	if pool == nil {
		c.JSON(http.StatusOK, gin.H{"enabled": true})
		return
	}
	var enabled bool
	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"enabled": true})
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": enabled})
}
