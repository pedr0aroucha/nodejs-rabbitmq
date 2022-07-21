import PaymentsConsumer from "./consumers/PaymentsConsumer";

async function main() {
  const numberOfConsumersPerQueue = Number(
    process.env.RABBITMQ_NUMBER_OF_CONSUMERS_PER_QUEUE
  );

  for await (const _ of Array(numberOfConsumersPerQueue).keys()) {
    await PaymentsConsumer.start();
  }

  console.log("RabbitMQ consumers started");
}

main();
