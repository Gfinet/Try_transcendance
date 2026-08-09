FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl
RUN apt-get install -y python3
RUN apt -y install pipx
RUN pipx install midea-beautiful-air
ENV PATH="/root/.local/bin:$PATH"

COPY ./ /data
WORKDIR /data

EXPOSE 5000

COPY launch.sh /launch.sh
RUN chmod +x /launch.sh

RUN rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["bash", "-c", "/launch.sh"]