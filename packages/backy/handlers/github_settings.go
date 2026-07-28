package handlers

import (
	"net/http"
	"time"

	"verso/backy/database"

	"github.com/gin-gonic/gin"
)

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
	var token *string
	var tokenUpdatedAt *time.Time

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username, token, token_updated_at FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled, &username, &token, &tokenUpdatedAt)
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
		HasToken:       token != nil && *token != "",
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
	var currentToken *string

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username, token FROM github_settings ORDER BY created_at LIMIT 1`,
	).Scan(&currentEnabled, &currentUsername, &currentToken)
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
	var tokenVal *string = currentToken

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
			tokenVal = nil
		} else {
			tokenVal = req.Token
		}
	}

	var tokenUpdatedAtUpdate string
	if tokenChanged {
		tokenUpdatedAtUpdate = ", token_updated_at = NOW()"
	}

	_, err = pool.Exec(c.Request.Context(),
		`UPDATE github_settings SET enabled = $1, username = $2, token = $3, updated_at = NOW()`+tokenUpdatedAtUpdate,
		enabled, username, tokenVal,
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
		HasToken:       tokenVal != nil && *tokenVal != "",
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
