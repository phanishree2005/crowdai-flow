FROM python:3.11-slim-bookworm

WORKDIR /app

# Install system dependencies required by OpenCV and aiortc
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 9003

# Run as non-root user
RUN useradd -m crowdflow
USER crowdflow

CMD ["python", "main.py"]
