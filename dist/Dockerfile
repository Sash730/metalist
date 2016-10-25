FROM node:argon

RUN mkdir /app

WORKDIR /app
ADD . /app
RUN npm install --production

CMD npm start
