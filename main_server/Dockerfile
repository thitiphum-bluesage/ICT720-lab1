FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV DB_URL="mongodb://ou_root:ou_secret@localhost:27017/iot_project"
ENV PORT=3000

EXPOSE 3000

CMD [ "npm", "start" ]
