FROM node:lts-alpine

# Install curl
RUN apk add --update curl && rm -f /var/cache/apk/*

# Bundle APP files
COPY ./site src/

# Copy health_checker
COPY health_checker /usr/local/bin

# Change workdir
WORKDIR src/

# Install app dependencies
RUN npm install --production && \
    chmod 111 /usr/local/bin/health_checker

# Running APP
CMD [ "npm", "run", "start" ]
