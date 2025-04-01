FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create versions directory if it doesn't exist
RUN mkdir -p /app/migrations/versions

# Run the application directly without an entrypoint script
CMD bash -c 'echo "Waiting for database to be ready..." && \
    sleep 5 && \
    if [ -z "$(ls -A /app/migrations/versions/)" ]; then \
        echo "No migrations found. Creating initial migration..." && \
        python /app/init_db.py; \
    else \
        echo "Running existing migrations..." && \
        alembic upgrade head; \
    fi && \
    if [ "$DATABASE_SEED" = "true" ]; then \
        echo "Populating database with mock data..." && \
        python /app/populate_db.py; \
    fi && \
    echo "Starting application..." && \
    uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload'