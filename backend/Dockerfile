# ────────────────────────────────────────────
# Backend Dockerfile — Multi-stage slim build
# ────────────────────────────────────────────
FROM python:3.12-slim AS base

# System deps for psycopg2 and cryptography wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=1.8.3
RUN pip install --no-cache-dir "poetry==${POETRY_VERSION}"

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY pyproject.toml poetry.lock* ./

# Install production deps only (no dev)
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --only main 2>/dev/null || \
       poetry install --no-interaction --no-ansi

# Copy application source
COPY . .

# ── Production stage ──
FROM python:3.12-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages and app from builder
COPY --from=base /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=base /usr/local/bin /usr/local/bin
COPY --from=base /app /app

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
