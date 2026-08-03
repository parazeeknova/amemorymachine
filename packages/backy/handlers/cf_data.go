package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"verso/backy/shared/logger"
)

// cfUser mirrors the subset of Codeforces user.info fields the portfolio renders.
type cfUser struct {
	Handle    string `json:"handle"`
	Rating    int    `json:"rating,omitempty"`
	Rank      string `json:"rank,omitempty"`
	MaxRating int    `json:"maxRating,omitempty"`
	MaxRank   string `json:"maxRank,omitempty"`
}

// cfRatingChange mirrors the subset of Codeforces user.rating fields we chart.
type cfRatingChange struct {
	ContestName             string `json:"contestName"`
	Rank                    int    `json:"rank"`
	OldRating               int    `json:"oldRating"`
	NewRating               int    `json:"newRating"`
	RatingUpdateTimeSeconds int64  `json:"ratingUpdateTimeSeconds,omitempty"`
}

// cfProblem mirrors the Codeforces problem object nested inside a submission.
type cfProblem struct {
	ContestID int    `json:"contestId"`
	Index     string `json:"index"`
	Name      string `json:"name"`
}

// cfSolvedProblem is an accepted problem plus when it was last solved.
type cfSolvedProblem struct {
	Name              string `json:"name"`
	SolvedTimeSeconds int64  `json:"solvedTimeSeconds"`
}

// cfSubmission mirrors the subset of Codeforces user.status fields we use.
type cfSubmission struct {
	Verdict             string    `json:"verdict"`
	CreationTimeSeconds int64     `json:"creationTimeSeconds"`
	Problem             cfProblem `json:"problem"`
}

// cfUserEnvelope decodes the Codeforces user.info API envelope.
type cfUserEnvelope struct {
	Status  string   `json:"status"`
	Comment string   `json:"comment,omitempty"`
	Result  []cfUser `json:"result"`
}

// cfRatingEnvelope decodes the Codeforces user.rating API envelope.
type cfRatingEnvelope struct {
	Status  string           `json:"status"`
	Comment string           `json:"comment,omitempty"`
	Result  []cfRatingChange `json:"result"`
}

// cfSubmissionEnvelope decodes the Codeforces user.status API envelope.
type cfSubmissionEnvelope struct {
	Status string         `json:"status"`
	Result []cfSubmission `json:"result"`
}

// cfDataResponse is the combined payload returned to the portfolio front-end.
type cfDataResponse struct {
	User        *cfUser           `json:"user"`
	Ratings     []cfRatingChange  `json:"ratings"`
	SolvedCount int               `json:"solvedCount"`
	LastSolved  []cfSolvedProblem `json:"lastSolved"`
}

// GetCFData proxies Codeforces user.info and user.rating through the server so
// the browser never calls codeforces.com directly (Codeforces sends no CORS
// headers, so a client-side fetch is blocked). The handle is read from the
// "handle" query parameter. When the handle is unknown or the Codeforces API
// is unreachable, a 200 with a null user is returned so the card can render a
// graceful "unavailable" state instead of erroring.
func (h *Handlers) GetCFData(c *gin.Context) {
	handle := c.Query("handle")
	if handle == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "handle is required"})
		return
	}

	encoded := url.QueryEscape(handle)
	client := &http.Client{Timeout: 10 * time.Second}

	userInfoURL := "https://codeforces.com/api/user.info?handles=" + encoded
	ratingURL := "https://codeforces.com/api/user.rating?handle=" + encoded

	userEnv, ok := fetchCodeforcesEnvelope[cfUserEnvelope](c, client, userInfoURL, "user.info")
	if !ok {
		// Network/decode failure — surface a 502 so the client retries and logs.
		c.JSON(http.StatusBadGateway, gin.H{"error": "codeforces api unavailable"})
		return
	}

	var user *cfUser
	if userEnv.Status == "OK" && len(userEnv.Result) > 0 {
		u := userEnv.Result[0]
		user = &u
	}

	// Rating history is best-effort: a valid handle may have no rated contests,
	// and a transient failure should not blank out the whole card.
	ratings := []cfRatingChange{}
	if ratingEnv, ratingOK := fetchCodeforcesEnvelope[cfRatingEnvelope](c, client, ratingURL, "user.rating"); ratingOK && ratingEnv.Status == "OK" {
		ratings = ratingEnv.Result
	}

	// Submission history drives the solved-count and "recently solved" stats.
	// Best-effort, like ratings, so a failure degrades gracefully.
	solvedCount := 0
	lastSolved := []cfSolvedProblem{}
	statusURL := "https://codeforces.com/api/user.status?handle=" + encoded + "&from=1&count=1000"
	if statusEnv, statusOK := fetchCodeforcesEnvelope[cfSubmissionEnvelope](c, client, statusURL, "user.status"); statusOK && statusEnv.Status == "OK" {
		solvedCount, lastSolved = cfSubmissionStats(statusEnv.Result)
	}

	c.JSON(http.StatusOK, cfDataResponse{
		User:        user,
		Ratings:     ratings,
		SolvedCount: solvedCount,
		LastSolved:  lastSolved,
	})
}

// cfSubmissionStats counts the distinct accepted problems in a submission
// history and returns the three most recently solved distinct problems. The
// user.status API returns submissions newest-first, so the first time we see a
// solved problem is its most recent solve.
func cfSubmissionStats(submissions []cfSubmission) (solvedCount int, lastSolved []cfSolvedProblem) {
	seen := make(map[string]struct{})
	lastSolved = []cfSolvedProblem{}
	for _, sub := range submissions {
		if sub.Verdict != "OK" || sub.Problem.Index == "" {
			continue
		}
		key := strconv.Itoa(sub.Problem.ContestID) + "-" + sub.Problem.Index
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		solvedCount++
		if len(lastSolved) < 3 {
			lastSolved = append(lastSolved, cfSolvedProblem{
				Name:              sub.Problem.Name,
				SolvedTimeSeconds: sub.CreationTimeSeconds,
			})
		}
	}
	return solvedCount, lastSolved
}

// fetchCodeforcesEnvelope performs a GET against a Codeforces API endpoint and
// decodes the envelope into T. It returns (zero, false) when the request could
// not be completed or the body could not be decoded; callers decide how to
// treat a non-"OK" status.
func fetchCodeforcesEnvelope[T any](c *gin.Context, client *http.Client, endpoint string, label string) (T, bool) {
	var zero T

	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, endpoint, nil)
	if err != nil {
		logger.Log.Error().Err(err).Str("endpoint", endpoint).Msg("codeforces: failed to create request")
		return zero, false
	}

	resp, err := client.Do(req)
	if err != nil {
		logger.Log.Error().Err(err).Str("endpoint", endpoint).Msg("codeforces " + label + " request error")
		return zero, false
	}

	body, readErr := io.ReadAll(resp.Body)
	_ = resp.Body.Close()
	if readErr != nil {
		logger.Log.Error().Err(readErr).Str("endpoint", endpoint).Msg("codeforces: failed to read " + label + " body")
		return zero, false
	}

	if resp.StatusCode != http.StatusOK {
		logger.Log.Error().Int("status", resp.StatusCode).Str("endpoint", endpoint).Str("body", string(body)).Msg("codeforces " + label + " api error")
		return zero, false
	}

	var env T
	if err := json.Unmarshal(body, &env); err != nil {
		logger.Log.Error().Err(err).Str("endpoint", endpoint).Str("body", string(body)).Msg("codeforces: failed to decode " + label)
		return zero, false
	}

	return env, true
}
