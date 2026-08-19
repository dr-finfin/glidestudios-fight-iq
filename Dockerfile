FROM docker.io/n8nio/n8n:latest

COPY certs/*.crt /etc/ssl/certs/supabase-ca.crt
