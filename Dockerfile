# Base image
FROM node:alpine

# Working directory
WORKDIR /app

RUN chown node:node /app

# Layer
COPY --chown=node:node package*.json ./

# COPY . .

# COPY package.json

USER node

RUN npm install --production

# Copy all but folders and files inside dockerignore file
COPY --chown=node:node . .

CMD [ "npm", "start" ]
