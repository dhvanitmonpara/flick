FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# install CPU torch + dependencies in one layer
RUN pip install --no-cache-dir \
    torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir detoxify fastapi uvicorn

# copy app code
COPY . .

RUN python -c "from detoxify import Detoxify; Detoxify('multilingual')"

EXPOSE 8000

CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"