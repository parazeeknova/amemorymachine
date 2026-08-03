-- Backfill descriptions for the default experience rows so the running site
-- shows the new write-ups without a template re-save.

UPDATE portfolio_experiences SET description = 'Owned self-hosted infra for 5 companies — Docker VPS fleets on Hetzner/Hostinger/OVH with Nginx/Traefik/Cloudflare and Portainer. AWS+GCP multi-cloud pipelines (EC2, RDS, S3, Lambda, GKE, GCS) with serverless offload to Vercel/Workers, CI/CD via Jenkins+GitHub Actions. Observability with Prometheus/Grafana/Sentry/PostHog; app layers on Next.js, tRPC, Postgres, Redis, Turso, Convex.' WHERE title LIKE '%Singularity Works%';

UPDATE portfolio_experiences SET description = 'Built the MERN backend + Socket.IO WebSocket APIs for a multi-tenant HRMS — real-time CRUD powering admin/super-admin dashboards with role-scoped access. RESTful FastAPI services for concurrent multi-camera video streams, handling session lifecycle and fan-out under load.' WHERE title LIKE '%amasQIS%';

UPDATE portfolio_experiences SET description = 'Led the browser club — cross-functional ops, team-lead coordination, community continuity between semesters. Produced written/visual content on web standards and open-source tooling. Built real-time multiplayer games with live leaderboards, cooperative sabotage hints and pair mechanics.' WHERE title LIKE '%Mozilla Firefox Club%';

UPDATE portfolio_experiences SET description = 'Handled ops, logistics and team coordination. Built a treasure-hunt app with admin dashboard (MongoDB, Express, React, Node) — REST + WebSocket for real-time participant tracking, game state and scoring, deployed on EC2 with Docker. Also shipped event sites and the club landing page.' WHERE title LIKE '%AI Club%';

UPDATE portfolio_experiences SET description = 'Frontend work on a non-profit site (first commercial project) — improved visibility and donation flow to widen reach for children lacking education, books and food.' WHERE title LIKE '%Operation Smile%';
