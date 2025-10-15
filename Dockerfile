# Use official Python image for backend
FROM python:3.11-slim AS backend

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .

# Build frontend
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Final image
FROM python:3.11-slim
WORKDIR /app

# Copy backend
COPY --from=backend /app/backend /app/backend

# Copy frontend build
COPY --from=frontend /app/frontend/build /app/backend/static/build
COPY --from=frontend /app/frontend/build/index.html /app/backend/templates/index.html

WORKDIR /app/backend
ENV PORT=${PORT:-8000} \
    DEBUG=False \
    ALLOWED_HOSTS=.railway.app
COPY backend/requirements.txt .
CMD ["gunicorn", "mealmate_project.wsgi:application", "--bind", "0.0.0.0:${PORT}", "--workers", "3"]
