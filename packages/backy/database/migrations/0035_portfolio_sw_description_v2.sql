-- Update the Singularity Works description: drop "self-hosted", add Azure
-- infra and the revenue highlight.

UPDATE portfolio_experiences SET description = 'Scaled infrastructure for 5 companies to 7-figure INR revenue in under 9 months — Docker VPS fleets on Hetzner/Hostinger/OVH with Nginx/Traefik/Cloudflare and Portainer. Multi-cloud pipelines across AWS (EC2, RDS, S3, Lambda, API Gateway, Route53, VPC), GCP (GKE, GCS, Cloud Functions) and Azure (VMs, Blob Storage, App Service), with serverless offload to Vercel/Lambda/Workers and CI/CD via Jenkins + GitHub Actions. Observability with Prometheus/Grafana/Sentry/PostHog; app layers on Next.js, tRPC, Postgres, Redis, Turso, Convex.' WHERE title LIKE '%Singularity Works%';
