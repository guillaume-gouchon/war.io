FROM node:8.9.4-slim

COPY . /usr/src
WORKDIR /usr/src

RUN npm install

CMD ["node", "."]

EXPOSE 8080
