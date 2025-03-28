# TSCMF Management Platform

Trade, Supply Chain, and Microfinance Management Platform (TSCMF) is a comprehensive system designed to manage financial transactions across various domains including trade finance, supply chain finance, and microfinance.

## Architecture

The application is built using a modern tech stack:

- **Frontend**: React.js with Tailwind CSS for a modern and responsive UI
- **Backend**: FastAPI (Python) for a high-performance API
- **Database**: PostgreSQL with Tortoise ORM for data persistence
- **Containerization**: Docker and Docker Compose for easy development and deployment

## Features

- Client management (financial institutions, obligors, etc.)
- Product management (various financial instruments)
- Transaction processing with multiple event types:
  - Inquiries
  - Requests
  - Amendments
  - RDA Processes
  - Transaction Closures
- Service integrations (simulated):
  - Sanctions screening
  - Eligibility checks
  - Limits management
  - Exposure management

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation and Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd tscmf-demo
   ```

2. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development

The application is set up with hot-reloading for both frontend and backend:

- Frontend changes will be immediately reflected in the browser
- Backend changes will automatically restart the server

## Project Structure

```
tscmf-demo/
├── backend/                # FastAPI backend application
│   ├── app/                # Application code
│   │   ├── models/         # Data models (Tortoise ORM)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── config.py       # Application configuration
│   │   └── main.py         # Application entry point
│   ├── Dockerfile          # Docker configuration for backend
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Entry point
│   ├── Dockerfile          # Docker configuration for frontend
│   └── package.json        # JavaScript dependencies
└── docker-compose.yml      # Docker Compose configuration
``` 