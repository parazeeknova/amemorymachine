-- Branded copy for the freelance client projects.

UPDATE portfolio_projects SET description = 'Singularity Works. We craft digital experiences that speak to the subconscious, creating profound connections through purposeful simplicity.' WHERE title LIKE 'itssingularity%';

UPDATE portfolio_projects SET description = 'ALLROUND PMC is a project management consultancy for luxury 5-star hospitality chains. We built their landing page, CMS, and job portal for the careers section, plus fully self-hosted infrastructure with uptime monitoring, OpenTelemetry, analytics, and CDN.' WHERE title LIKE 'ALLROUND%';

UPDATE portfolio_projects SET description = 'Oryx is a premium 5-star hotel supplies brand in the UAE, known for premium cutlery. We built their e-commerce, invoice management, CRM, and inventory systems.' WHERE title LIKE 'Oryx%';

UPDATE portfolio_projects SET description = 'Saltwise is an AI agent for doctors: given a chemical formula it searches medication alternatives over the web, talks back through TTS/STT, and breaks down each option in detail, including what could go wrong.' WHERE title LIKE 'Saltwise%';
