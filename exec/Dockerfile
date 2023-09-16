FROM python:3.8


RUN useradd -m myuser

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
RUN chown -R myuser:myuser /usr/src/app
ENV PYTHONUNBUFFERED=1
EXPOSE 6969


USER myuser

CMD ["python", "-u","app.py"]
