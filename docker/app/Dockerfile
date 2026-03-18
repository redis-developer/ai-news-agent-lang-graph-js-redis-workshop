FROM node:24-alpine

# Install ttyd, tmux, screen for shared sessions, and bash
RUN apk add --no-cache ttyd tmux bash

WORKDIR /app

# Copy scripts and config
COPY start.sh /start.sh
COPY tmux.conf /etc/tmux.conf
RUN chmod +x /start.sh

# Expose Vite, Express, and ttyd ports
EXPOSE 3000 5173 7681

# Start tmux session and ttyd
CMD ["/start.sh"]

