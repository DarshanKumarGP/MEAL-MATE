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

# Copy backend dependencies and install gunicorn
COPY --from=backend /app/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend and built frontend assets
COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend/build /app/backend/static/build
COPY --from=frontend /app/frontend/build/index.html /app/backend/templates/index.html

WORKDIR /app/backend
ENV DEBUG=False ALLOWED_HOSTS=.railway.app

# Use fixed port instead of variable
CMD ["gunicorn", "mealmate_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
