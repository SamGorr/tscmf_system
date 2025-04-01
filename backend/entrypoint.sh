#!/bin/sh

# Wait for the database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Check if we have any migrations
if [ -z "$(ls -A /app/migrations/versions/)" ]; then
    echo "No migrations found. Creating initial migration..."
    python /app/init_db.py
else
    # Run migrations
    echo "Running existing migrations..."
    alembic upgrade head
fi

# Start the application
echo "Starting application..."
uvicorn src.main:app --host 0.0.0.0 --port 5000 --reload 