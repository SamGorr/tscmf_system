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

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Create versions directory if it doesn't exist
RUN mkdir -p /app/migrations/versions

# Run migrations and start the application
ENTRYPOINT ["./entrypoint.sh"] 