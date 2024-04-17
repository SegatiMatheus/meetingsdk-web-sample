FROM node:20.12.1

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build

EXPOSE 9998

CMD ["npm", "start"]