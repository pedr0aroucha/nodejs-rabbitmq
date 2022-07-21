FROM node:16

WORKDIR /producers

COPY . .

RUN npm install --omit=dev

CMD [ "npm", "run", "producers" ]