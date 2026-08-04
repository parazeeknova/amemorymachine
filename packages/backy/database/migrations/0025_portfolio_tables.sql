-- Create portfolio_profiles, portfolio_experiences, and portfolio_projects tables for customizable pinned templates

CREATE TABLE IF NOT EXISTS portfolio_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    tagline TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    username TEXT NOT NULL DEFAULT '',
    links JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES portfolio_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    period TEXT NOT NULL DEFAULT '',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES portfolio_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    readme_url TEXT NOT NULL DEFAULT '',
    repo_url TEXT NOT NULL DEFAULT '',
    product_url TEXT NOT NULL DEFAULT '',
    stack TEXT NOT NULL DEFAULT '',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default portfolio profile if none exists
DO $$
DECLARE
    v_profile_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM portfolio_profiles) THEN
        INSERT INTO portfolio_profiles (name, tagline, description, email, username, links, is_pinned)
        VALUES (
            'Harsh Sahu',
            'designer portfolio',
            'Engineer and founder, building systems, infrastructure, and tools. Author of [asocialmedia](https://www.asocialmedia.cc). Runs [Singularity Works](https://www.itsingularity.com), an opinionated product studio. CS undergrad who builds things that shouldn''t exist yet, then open-sources them so you can too. Occasional [hackathon](https://www.linkedin.com/in/hashk/details/honors/) winner, published [researcher](https://www.orcid.org/0009-0008-9861-9181).',
            'harsh@itssingularity.com',
            'parazeeknova',
            '{"portfolio":{"label":"designer portfolio","url":"https://folio.przknv.cc"},"asocialmedia":{"label":"asocialmedia","url":"https://www.asocialmedia.cc"},"singularity":{"label":"Singularity Works","url":"https://www.itsingularity.com"},"github":{"label":"GitHub","url":"https://www.github.com/parazeeknova"},"linkedin":{"label":"LinkedIn","url":"https://www.linkedin.com/in/hashk"},"twitter":{"label":"X","url":"https://www.x.com/parazeeknova"}}'::jsonb,
            TRUE
        )
        RETURNING id INTO v_profile_id;

        INSERT INTO portfolio_experiences (profile_id, title, location, period, description, position) VALUES
        (v_profile_id, 'Founder & Infrastructure Engineer — Singularity Works', 'Remote (India)', 'August 25'' –Present', 'Owned self-hosted infra for 5 companies — Docker VPS fleets on Hetzner/Hostinger/OVH with Nginx/Traefik/Cloudflare and Portainer. AWS+GCP multi-cloud pipelines (EC2, RDS, S3, Lambda, GKE, GCS) with serverless offload to Vercel/Workers, CI/CD via Jenkins+GitHub Actions. Observability with Prometheus/Grafana/Sentry/PostHog; app layers on Next.js, tRPC, Postgres, Redis, Turso, Convex.', 0),
        (v_profile_id, 'Full Stack Developer Intern — amasQIS.ai', 'Remote (Muscat, Oman)', 'April 25''–November 25''', 'Built the MERN backend + Socket.IO WebSocket APIs for a multi-tenant HRMS — real-time CRUD powering admin/super-admin dashboards with role-scoped access. RESTful FastAPI services for concurrent multi-camera video streams, handling session lifecycle and fan-out under load.', 1),
        (v_profile_id, 'President — Mozilla Firefox Club (VIT)', 'University (VIT)', 'June 25''–February 26''', 'Led the browser club — cross-functional ops, team-lead coordination, community continuity between semesters. Produced written/visual content on web standards and open-source tooling. Built real-time multiplayer games with live leaderboards, cooperative sabotage hints and pair mechanics.', 2),
        (v_profile_id, 'Operations Manager — AI Club (VIT)', 'University (VIT)', 'June 25''–January 26''', 'Handled ops, logistics and team coordination. Built a treasure-hunt app with admin dashboard (MongoDB, Express, React, Node) — REST + WebSocket for real-time participant tracking, game state and scoring, deployed on EC2 with Docker. Also shipped event sites and the club landing page.', 3),
        (v_profile_id, 'Frontend Developer — Operation Smile Foundation (NGO,Non-profit)', 'Remote (India)', 'April 24''–June 24''', 'Frontend work on a non-profit site (first commercial project) — improved visibility and donation flow to widen reach for children lacking education, books and food.', 4);

        INSERT INTO portfolio_projects (profile_id, title, description, image, stack, readme_url, repo_url, product_url, position) VALUES
        (v_profile_id, 'Doty is an over-configured nix flake for opinionated developers', 'A fully declarative, highly opinionated, and reproducible NixOS/Hyprland desktop environment. Equipped with a custom Rust-based daemon (wabi), interactive QML-based Quickshell widgets, and dynamic Material You color schemes generated from your wallpapers via Matugen. Includes local AI workflows (OCR, Speech-to-Text, and LLMs) along with Waydroid virtualization and Cockpit server panel integration out of the box. Designed to look gorgeous without bloated overhead.', 'https://img.przknv.cc/t/doty.png', 'Nix, NixOS, Hyprland, Quickshell, Qt, QML, Rust, Matugen, Waydroid, Distrobox, Home Manager', 'https://raw.githubusercontent.com/parazeeknova/doty/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/doty', 'https://github.com/parazeeknova/doty', 0),
        (v_profile_id, 'Gitcha is a native git GUI written in rust to be blazing fast and light that goes brr', 'A local-first git visualizer built in Rust with egui. Commit graph, syntax-highlighted diffs, file tree with git status, and drag-to-merge all in a ~5MB binary with no Electron, no webview, no cloud, and no subscription for a picture of your own repo. Talks directly to libgit2. Named at 2am. No regrets.', 'https://img.przknv.cc/t/gitcha.png', 'Rust, egui, eframe, git2, libgit2, diffy, similar, syntect, egui-arbor, egui-phosphor', 'https://raw.githubusercontent.com/parazeeknova/gitcha/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/gitcha', 'https://github.com/parazeeknova/gitcha/releases', 1),
        (v_profile_id, 'Lumen is a spatial system for organizing work.', 'A local-first spatial workspace for free-form kanban, structured tasks, durable offline work, and realtime collaboration with other goodies.', 'https://img.przknv.cc/t/Screenshot_2026-07-08_22.51.03.png', 'Next.js, Elysia, Elixir, Typescript, Bun, PostgreSQL, Redis, Yjs, Zustand, Tailwind, Tauri, CRDTs, Docker, Playwright, Bun Test, K6 and more', 'https://raw.githubusercontent.com/singularityworks-xyz/lumen/refs/heads/origin/.github/README.md', 'https://github.com/singularityworks-xyz/lumen', 'https://lumen.itssingularity.com', 2),
        (v_profile_id, 'asocialmedia formerly zephyr is the last social platform you''ll ever need. Open source, cozy, and slightly unhinged. ', 'A social platform that brings your entire internet into one place. Unified feed, communities, real-time chat, rich media and tipping all tied together by Aura, a reputation system that grows with you, and Zeph, an AI companion that actually remembers you. Built by one person. Slightly unhinged in ambition.', 'https://img.przknv.cc/t/Gk8Fy0aaMAARWSc.jpg', 'Next.js, React, Elysia, Elixir, TypeScript, Tailwind CSS, PostgreSQL, Redis, RustFS, RabbitMQ, MeiliSearch, AI-sdk, Docker and more', 'https://raw.githubusercontent.com/asocialmedia/social/refs/heads/main/.github/README.md', 'https://github.com/asocialmedia/social', 'https://asocialmedia.cc', 3),
        (v_profile_id, 'Papyrus is a realtime collaborative spreadsheet', 'Realtime collaborative spreadsheet with a local-first document model, CRDT-based syncing, worker-driven evaluation, and a virtualized grid built to stay responsive on 10K+ row datasets.', '', 'Next.js, Elixir, TypeScript, Bun, Firestore, Yjs, Zustand, Tailwind CSS, CRDTs, Docker and more', 'https://raw.githubusercontent.com/parazeeknova/papyrus/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/papyrus', 'https://sheets.przknv.cc', 4),
        (v_profile_id, 'Personal knowledge base and folio, blog for public face & private brain, one app', 'Personal knowledge base and folio, blog for public face & private brain, one app that doesn''t apologize for being both. the left side is where i exist as a person (public face): my projects, my work, my contribution graph. the right side is where i think out loud (private brain): notes, docs, blog posts, half-baked ideas.', '', 'Tanstack Start, Vite, Vitest, Golang, TypeScript, Postgres, TipTap, CRDTs, Tailwind CSS, Cloudflare, Docker and more', 'https://raw.githubusercontent.com/parazeeknova/verso/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/verso', 'https://www.przknv.cc', 5),
        (v_profile_id, 'Snix is a Terminal snippet manager', 'Fast TUI with hierarchical notebooks, fuzzy search, syntax highlighting for 25+ languages, and versioned storage.', '', 'Rust, Ratatui', 'https://raw.githubusercontent.com/parazeeknova/snix/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/snix', '', 6),
        (v_profile_id, 'Nyxtext Zenith is a Keyboard-first code editor', 'Windows code editor with built-in terminal. Supports 35+ languages, code folding, Lua customization, and QScintilla-based editing.', '', 'Python, PyQt, QScintilla', 'https://raw.githubusercontent.com/parazeeknova/nyxtext-zenith/refs/heads/main/.github/README.md', 'https://github.com/parazeeknova/nyxtext-zenith', '', 7);
    END IF;
END $$;
