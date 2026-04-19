# -------- moderation/Dockerfile --------
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir \
    onnxruntime \
    fastapi \
    uvicorn[standard] \
    transformers \
    numpy

WORKDIR /app

# Copy pre-exported model (do this once locally: see export script below)
COPY model/ ./model/
COPY main.py ./

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]