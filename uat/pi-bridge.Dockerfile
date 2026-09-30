FROM node:24-bookworm-slim

WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 python3-pip \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g @earendil-works/pi-coding-agent@0.87.1 \
  && pip3 install --break-system-packages --no-cache-dir fastapi uvicorn pydantic

COPY uat/__init__.py /app/uat/__init__.py
COPY uat/pi_openai_bridge /app/uat/pi_openai_bridge

ENV PI_BRIDGE_BIN=pi
EXPOSE 8787
CMD ["python3", "-m", "uvicorn", "uat.pi_openai_bridge.pi_openai_bridge:app", "--host", "0.0.0.0", "--port", "8787"]
