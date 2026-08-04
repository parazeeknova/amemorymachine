package handlers

import (
	"net/http"

	"verso/backy/database"

	"github.com/gin-gonic/gin"
)

type CFSettings struct {
	Enabled  bool   `json:"enabled"`
	Username string `json:"username"`
}

func (h *Handlers) GetCFSettings(c *gin.Context) {
	pool := database.PoolAvailable()
	if pool == nil {
		c.JSON(http.StatusOK, CFSettings{Enabled: false, Username: "parazeeknova"})
		return
	}

	var enabled bool
	var username string

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username FROM cf_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled, &username)
	if err != nil {
		c.JSON(http.StatusOK, CFSettings{Enabled: false, Username: "parazeeknova"})
		return
	}

	c.JSON(http.StatusOK, CFSettings{
		Enabled:  enabled,
		Username: username,
	})
}

type updateCFSettingsRequest struct {
	Enabled  *bool   `json:"enabled,omitempty"`
	Username *string `json:"username,omitempty"`
}

func (h *Handlers) UpdateCFSettings(c *gin.Context) {
	pool := database.PoolAvailable()
	if pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}

	var req updateCFSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var currentEnabled bool
	var currentUsername string

	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled, username FROM cf_settings ORDER BY created_at LIMIT 1`,
	).Scan(&currentEnabled, &currentUsername)
	if err != nil {
		_, err = pool.Exec(c.Request.Context(),
			`INSERT INTO cf_settings (enabled, username) VALUES (false, 'parazeeknova')`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to init settings"})
			return
		}
		currentEnabled = false
		currentUsername = "parazeeknova"
	}

	enabled := currentEnabled
	username := currentUsername

	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	if req.Username != nil {
		username = *req.Username
	}

	_, err = pool.Exec(c.Request.Context(),
		`UPDATE cf_settings SET enabled = $1, username = $2, updated_at = NOW()`,
		enabled, username,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, CFSettings{
		Enabled:  enabled,
		Username: username,
	})
}

func (h *Handlers) GetCFEnabledStatus(c *gin.Context) {
	pool := database.PoolAvailable()
	if pool == nil {
		c.JSON(http.StatusOK, gin.H{"enabled": false})
		return
	}
	var enabled bool
	err := pool.QueryRow(c.Request.Context(),
		`SELECT enabled FROM cf_settings ORDER BY created_at LIMIT 1`,
	).Scan(&enabled)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"enabled": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"enabled": enabled})
}
