FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching). Dev deps are kept for nodemon.
COPY package*.json ./
RUN npm install

# Copy source (overridden by a bind mount in docker-compose for hot reload).
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
