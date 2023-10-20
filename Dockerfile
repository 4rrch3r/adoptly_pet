FROM node:slim

RUN npm install -g nodemon

WORKDIR /node

COPY package.json .

COPY src/ src/ 

COPY docs/ docs/

COPY .env .

RUN npm install

CMD [ "npm" , "start" ]