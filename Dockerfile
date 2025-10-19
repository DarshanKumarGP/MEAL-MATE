# Use official Python image for backend build stage
FROM python:3.11-slim AS backend

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend .

# Build frontend stage
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Final runtime image
FROM python:3.11-slim
WORKDIR /app

# Copy backend dependencies and install gunicorn and whitenoise
COPY --from=backend /app/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn whitenoise

# Copy backend source code
COPY --from=backend /app/backend /app/backend

# Copy frontend built assets to backend static dir for serving
COPY --from=frontend /app/frontend/build /app/backend/static/build

# Copy frontend index.html to backend templates for catch-all SPA serving
COPY --from=frontend /app/frontend/build/index.html /app/backend/templates/index.html

WORKDIR /app/backend

# Environment variables for production
ENV DEBUG=False
ENV ALLOWED_HOSTS=.railway.app

# Run collectstatic to gather static files correctly for production serving
RUN python manage.py collectstatic --noinput

# Gunicorn command to run the application on port 8000
CMD ["gunicorn", "mealmate_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
