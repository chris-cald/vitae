FROM python:3.14-slim

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN grep -v '^sentence-transformers$' requirements.txt > /tmp/requirements-uat.txt \
  && pip install --no-cache-dir -r /tmp/requirements-uat.txt

COPY . .
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
