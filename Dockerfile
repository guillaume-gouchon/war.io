FROM node:8.9.4-slim

COPY . /usr/src
WORKDIR /usr/src

RUN apt-get install make ruby ruby-dev
RUN gem install sass compass

RUN npm install
RUN npm run build

CMD ["node", "."]

EXPOSE 8080
