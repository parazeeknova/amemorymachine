-- Three buildspace photos for the nights & weekends timeline entry.

UPDATE portfolio_projects SET
  image = 'https://img.przknv.cc/t/bs1.avif',
  logo = 'https://img.przknv.cc/t/bs2.avif',
  readme_url = 'https://img.przknv.cc/t/bs3.avif'
WHERE title = 'Nyxtext Zenith' AND section = 'hackathon';
