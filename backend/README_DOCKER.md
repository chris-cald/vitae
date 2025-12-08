## Alembic Migrations

To create and apply migrations inside the backend container:

```sh
docker-compose exec backend alembic revision --autogenerate -m "Initial migration"
docker-compose exec backend alembic upgrade head
```

Make sure your DATABASE_URL is set correctly for SQLite or PostgreSQL.
## Database Initialization

### SQLite (default)
No manual setup required. The database file (`test.db`) will be created automatically in the backend container.

### PostgreSQL
If you switch to PostgreSQL, the database will be created by the container. Ensure your `DATABASE_URL` is set to:
```
postgresql+asyncpg://postgres:postgres@postgres:5432/vitae
```

#### Initializing tables
FastAPI/SQLModel will create tables automatically on first run via the `init_db()` function in `db.py`.

If you need to run migrations, consider using Alembic or a similar tool for production.

# Docker Setup for Vitae Backend

## Build the Docker image
```sh
docker build -t vitae-backend .
```

## Run the container
```sh
docker run -p 8000:8000 vitae-backend
```

## Docker Compose (Recommended)
Build and start the backend service:
```sh
docker-compose up --build
```

Stop the service:
```sh
docker-compose down
```

## Access the API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
