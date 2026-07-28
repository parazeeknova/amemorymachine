package handlers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"io"
	"net/http"
	"os"
	"strings"

	"verso/backy/database"

	"github.com/gin-gonic/gin"
)

func deriveEncryptionKey() []byte {
	secret := os.Getenv("ENCRYPTION_SECRET")
	if secret == "" {
		if machineID, err := os.ReadFile("/etc/machine-id"); err == nil {
			secret = strings.TrimSpace(string(machineID))
		} else {
			secret = "verso-dev-key-change-me"
		}
	}
	hash := sha256.Sum256([]byte(secret))
	return hash[:]
}

func encryptToken(plaintext string) ([]byte, error) {
	key := deriveEncryptionKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	return aesGCM.Seal(nonce, nonce, []byte(plaintext), nil), nil
}

func decryptToken(ciphertext []byte) (string, error) {
	key := deriveEncryptionKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", io.ErrUnexpectedEOF
	}
	nonce, ct := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ct, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

type GitHubSettings struct {
	Enabled  bool   `json:"enabled"`
	Username string `json:"username"`
	HasToken bool   `json:"hasToken"`
}

func (h *Handlers) GetGitHubSettings(c *gin.Context) {
	pool := database.GetPool()
	var enabled bool
	var username string
	var tokenEncrypted []byte

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username, token_encrypted FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled, &username, &tokenEncrypted)
	if err != nil {
		c.JSON(http.StatusOK, GitHubSettings{Enabled: true, Username: "parazeeknova"})
		return
	}

	c.JSON(http.StatusOK, GitHubSettings{
		Enabled:  enabled,
		Username: username,
		HasToken: len(tokenEncrypted) > 0,
	})
}

type updateGitHubSettingsRequest struct {
	Enabled  *bool   `json:"enabled,omitempty"`
	Username *string `json:"username,omitempty"`
	Token    *string `json:"token,omitempty"`
}

func (h *Handlers) UpdateGitHubSettings(c *gin.Context) {
	pool := database.GetPool()
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
		// Insert initial row
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
	if req.Token != nil {
		if *req.Token == "" {
			tokenBytes = nil
		} else {
			encrypted, err := encryptToken(*req.Token)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encrypt token"})
				return
			}
			tokenBytes = encrypted
		}
	}

	_, err = pool.Exec(c.Request.Context(),
		`UPDATE github_settings SET enabled = $1, username = $2, token_encrypted = $3, updated_at = NOW()`,
		enabled, username, tokenBytes,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	if h.statsCache != nil {
		h.statsCache.Clear()
	}

	c.JSON(http.StatusOK, GitHubSettings{
		Enabled:  enabled,
		Username: username,
		HasToken: len(tokenBytes) > 0,
	})
}
