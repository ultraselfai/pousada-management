---
slug: deployment
category: operations
generatedAt: 2026-01-30T03:22:53.984Z
relevantFiles:
  - docker-compose.yml
---

# How do I deploy this project?

## Deployment

### Docker

This project includes Docker configuration.

```bash
docker build -t app .
docker run -p 3000:3000 app
```

### CI/CD

CI/CD pipelines are configured for this project.
Check `.github/workflows/` or equivalent for pipeline configuration.