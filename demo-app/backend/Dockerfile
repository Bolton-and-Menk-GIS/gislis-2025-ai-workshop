FROM python:3.11-slim

WORKDIR /code

# Install build tools and Postgres dev libs
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    tesseract-ocr \
    poppler-utils \
    git \
    && rm -rf /var/lib/apt/lists/*
    
# manual install of pgvector since it has no wheels and fails to build sometimes
WORKDIR /tmp
RUN git clone --branch v0.6.0 https://github.com/pgvector/pgvector.git

# build and install pgvector
WORKDIR /tmp/pgvector
RUN make && make install

# remove pgvector source
WORKDIR /
RUN rm -rf /tmp/pgvector

COPY requirements.txt .
COPY migrations/versions ./migrations/versions
copy alembic.ini .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install watchfiles

RUN alembic upgrade head

# Copy entrypoint files (but app code will be mounted)
COPY ./app ./app
COPY ./surveys ./surveys

RUN mkdir -p /code/static

# Enable polling for file changes (fixes reload with Docker bind mounts)
ENV WATCHFILES_FORCE_POLLING=true

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000",  "--reload", "--reload-delay", "1"]

