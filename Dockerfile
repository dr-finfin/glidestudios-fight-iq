FROM docker.io/n8nio/n8n:latest

USER root

RUN mkdir -p /opt/custom-certificates \
    && chown -R 1000:1000 /opt/custom-certificates

COPY --chown=1000:1000 certs/*.crt /opt/custom-certificates/

USER node