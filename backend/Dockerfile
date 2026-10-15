FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Generate synthetic dataset and train baseline ML model at build time
RUN python data/generate_dataset.py

EXPOSE 8000

ENV PORT=8000
ENV HOST=0.0.0.0
ENV SJS_PEPPER=ZIM_SJS_PRODUCTION_PEPPER_CHANGE_ME_IN_ENV

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
