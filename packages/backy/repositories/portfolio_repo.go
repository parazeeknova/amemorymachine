package repositories

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"verso/backy/database"
	"verso/backy/database/models"
)

type PortfolioRepo struct {
	pool *pgxpool.Pool
}

func NewPortfolioRepo() *PortfolioRepo {
	return &PortfolioRepo{pool: database.GetPool()}
}

func (r *PortfolioRepo) GetPinnedProfile(ctx context.Context) (models.Profile, error) {
	var profile models.Profile
	var linksBytes []byte

	row := r.pool.QueryRow(ctx, `
		SELECT name, tagline, description, email, username, resume_url, links
		FROM portfolio_profiles
		WHERE is_pinned = true
		ORDER BY updated_at DESC
		LIMIT 1
	`)

	err := row.Scan(&profile.Name, &profile.Tagline, &profile.Description, &profile.Email, &profile.Username, &profile.ResumeURL, &linksBytes)
	if err != nil {
		return profile, err
	}

	if len(linksBytes) > 0 {
		var links map[string]models.Link
		if err := json.Unmarshal(linksBytes, &links); err == nil {
			profile.Links = links
		}
	}
	if profile.Links == nil {
		profile.Links = make(map[string]models.Link)
	}

	return profile, nil
}

func (r *PortfolioRepo) GetPinnedExperiences(ctx context.Context) ([]models.ExperienceItem, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT e.title, e.location, e.period, e.description
		FROM portfolio_experiences e
		JOIN portfolio_profiles p ON e.profile_id = p.id
		WHERE p.is_pinned = true
		ORDER BY e.position ASC, e.created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var experiences []models.ExperienceItem
	for rows.Next() {
		var item models.ExperienceItem
		if err := rows.Scan(&item.Title, &item.Location, &item.Period, &item.Description); err != nil {
			return nil, err
		}
		experiences = append(experiences, item)
	}
	if experiences == nil {
		experiences = []models.ExperienceItem{}
	}
	return experiences, nil
}

func (r *PortfolioRepo) GetPinnedProjects(ctx context.Context) ([]models.Project, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT pr.title, pr.description, pr.image, pr.readme_url, pr.repo_url, pr.product_url, pr.stack
		FROM portfolio_projects pr
		JOIN portfolio_profiles p ON pr.profile_id = p.id
		WHERE p.is_pinned = true
		ORDER BY pr.position ASC, pr.created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var item models.Project
		if err := rows.Scan(&item.Title, &item.Desc, &item.Image, &item.ReadmeURL, &item.RepoURL, &item.ProductURL, &item.Stack); err != nil {
			return nil, err
		}
		projects = append(projects, item)
	}
	if projects == nil {
		projects = []models.Project{}
	}
	return projects, nil
}

func (r *PortfolioRepo) SaveAndPinPortfolio(ctx context.Context, userID *string, profile models.Profile, experiences []models.ExperienceItem, projects []models.Project) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `UPDATE portfolio_profiles SET is_pinned = false WHERE is_pinned = true`)
	if err != nil {
		return fmt.Errorf("unpin profiles: %w", err)
	}

	linksBytes, err := json.Marshal(profile.Links)
	if err != nil {
		return fmt.Errorf("marshal links: %w", err)
	}

	var profileID string
	err = tx.QueryRow(ctx, `
		INSERT INTO portfolio_profiles (user_id, name, tagline, description, email, username, resume_url, links, is_pinned)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
		RETURNING id
	`, userID, profile.Name, profile.Tagline, profile.Description, profile.Email, profile.Username, profile.ResumeURL, linksBytes).Scan(&profileID)
	if err != nil {
		return fmt.Errorf("insert profile: %w", err)
	}

	for idx, exp := range experiences {
		_, err = tx.Exec(ctx, `
			INSERT INTO portfolio_experiences (profile_id, title, location, period, description, position)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, profileID, exp.Title, exp.Location, exp.Period, exp.Description, idx)
		if err != nil {
			return fmt.Errorf("insert experience: %w", err)
		}
	}

	for idx, proj := range projects {
		_, err = tx.Exec(ctx, `
			INSERT INTO portfolio_projects (profile_id, title, description, image, readme_url, repo_url, product_url, stack, position)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, profileID, proj.Title, proj.Desc, proj.Image, proj.ReadmeURL, proj.RepoURL, proj.ProductURL, proj.Stack, idx)
		if err != nil {
			return fmt.Errorf("insert project: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *PortfolioRepo) UnpinPortfolio(ctx context.Context) error {
	_, err := r.pool.Exec(ctx, `UPDATE portfolio_profiles SET is_pinned = false WHERE is_pinned = true`)
	return err
}
