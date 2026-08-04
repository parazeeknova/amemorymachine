-- Fix the oryx image path, brand the Singularity Works title, and expand
-- the freelance copy.

UPDATE portfolio_projects SET image = 'https://img.przknv.cc/t/oryx.webp' WHERE title LIKE 'Oryx%';

UPDATE portfolio_projects SET title = 'Singularity Works' WHERE title LIKE 'itssingularity%';

UPDATE portfolio_projects SET description = 'Singularity Works is our product studio. The landing page tells the brand story: we craft digital experiences that speak to the subconscious, creating profound connections through purposeful simplicity. Designed and built in-house, covering the studio positioning, the product portfolio, and everything we ship.' WHERE title LIKE 'Singularity%';

UPDATE portfolio_projects SET description = 'ALLROUND PMC is a project management consultancy that builds luxury 5-star hotel chains. We delivered their complete digital presence: a polished landing page, a CMS for site content, a job portal for the careers section, and fully self-hosted infrastructure with uptime monitoring, OpenTelemetry tracing, analytics, and CDN edge delivery.' WHERE title LIKE 'ALLROUND%';

UPDATE portfolio_projects SET description = 'Oryx Hotel Supplies is a premium 5-star hotel supplies brand in the UAE, known for its premium cutlery. We built their full commerce stack: e-commerce storefront, invoice management, CRM, and inventory systems.' WHERE title LIKE 'Oryx%';

UPDATE portfolio_projects SET description = 'Saltwise is an AI agent built for doctors. Given a chemical formula, it searches for alternative medications across the web, talks back through TTS/STT, and presents each option in detail: mechanism, dosing, availability, and what could go wrong, including interactions and contraindications.' WHERE title LIKE 'Saltwise%';
