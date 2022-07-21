FROM node:16

WORKDIR /consumers

COPY . .

RUN npm install --omit=dev

# wait for the rabbitmq server to start
RUN sleep 25

CMD [ "npm", "run", "consumers" ]