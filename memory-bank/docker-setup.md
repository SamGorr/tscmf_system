# TSCMF Management Platform - Docker Setup

## Docker Compose Configuration

The application is containerized using Docker Compose with the following services:

### Backend Service
```yaml
backend:
  build: ./backend
  container_name: tscmf-backend
  ports:
    - 5000:5000
  volumes:
    - ./backend:/app
  environment:
    - DATABASE_URL=postgresql://sam:test123@db:5432/tscmf_db
    - DATABASE_SEED=true
  depends_on:
    - db
  restart: unless-stopped
```

### Frontend Service
```yaml
frontend:
  build: ./frontend
  container_name: tscmf-frontend
  ports:
    - 3000:3000
  volumes:
    - ./frontend:/app
    - /app/node_modules
  environment:
    - REACT_APP_API_URL=http://localhost:5000
    - WDS_SOCKET_HOST=127.0.0.1
    - CHOKIDAR_USEPOLLING=true
    - WDS_SOCKET_PORT=0
    - HOST=0.0.0.0
    - PUBLIC_URL=http://localhost:3000
  depends_on:
    - backend
```

### Database Service
```yaml
db:
  image: postgres:15
  ports:
    - 5432:5432
  container_name: tscmf-postgres
  environment:
    - POSTGRES_USER=sam
    - POSTGRES_PASSWORD=test123
    - POSTGRES_DB=tscmf_db
  volumes:
    - postgres_data:/var/lib/postgresql/data
  restart: unless-stopped
```

### Database Admin Interface
```yaml
pgadmin4:
  container_name: my_pgadmin4
  image: dpage/pgadmin4
  restart: "always"
  environment:
    PGADMIN_DEFAULT_EMAIL: "sam@gmail.com"
    PGADMIN_DEFAULT_PASSWORD: "test123"
    PGADMIN_CONFIG_SESSION_EXPIRATION_TIME: 365
    PGADMIN_CONFIG_MAX_SESSION_IDLE_TIME: 60
  volumes:
    - pgadmin4-data:/var/lib/pgadmin
  ports:
    - "5050:80"
  extra_hosts:
    - "host.docker.internal:host-gateway"
```

## Volumes
```yaml
volumes:
  postgres_data:
  pgadmin4-data:
```

## Docker Development Setup

### Backend Dockerfile
```
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]
```

### Frontend Dockerfile
```
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## Key Features
- Hot reloading for both frontend and backend
- Mounted volumes for local development
- PostgreSQL database persisted in a Docker volume
- Database administration via pgAdmin
- Environment variables for configuration
- Automatic database connection and seeding 