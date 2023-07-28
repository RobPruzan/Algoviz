
FROM python:3.8

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    default-jdk \
    gcc \
    g++ \
    nodejs \
    npm \
    rustc \
    cargo \
    ruby \
    golang \
    && rm -rf /var/lib/apt/lists/*


RUN pip install --no-cache-dir flask


COPY . /usr/src/app


EXPOSE 8080


CMD ["python", "app.py"]
