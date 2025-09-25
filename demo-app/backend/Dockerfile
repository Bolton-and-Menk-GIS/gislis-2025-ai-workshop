FROM python:3.11-slim

WORKDIR /code

# Install build tools and Postgres dev libs
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*
    

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install watchfiles

# Copy entrypoint files (but app code will be mounted)
COPY ./app ./app
COPY ./surveys ./surveys

RUN mkdir -p /code/static

# Enable polling for file changes (fixes reload with Docker bind mounts)
ENV WATCHFILES_FORCE_POLLING=true

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000",  "--reload", "--reload-delay", "1"]

