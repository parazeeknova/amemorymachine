-- Remove the Summer of Bitcoin and buildspace timeline entries.

DELETE FROM portfolio_projects WHERE title = 'Bitcoin Development Trainee' OR title = 'Nyxtext Zenith';
