import { createHash } from "crypto";

import { Channel, ConsumeMessage } from "amqplib";

import RabbitMQ from "../RabbitMQ";

function hashHeader(hash: string) {
  return hash.substring(0, 8);
}

export async function consumerFactory(
  rabbitMQ: RabbitMQ,
  worker: (payloadMessage: any) => Promise<any>
) {
  await rabbitMQ.setup();

  let running = false;

  rabbitMQ.consumeFromQueue(
    async (message: ConsumeMessage | null, channel: Channel) => {
      if (!message || running) return;

      const payloadMessage = JSON.parse(message.content.toString());

      const payloadMessageHash = createHash("sha256")
        .update(JSON.stringify(payloadMessage) + new Date().getTime())
        .digest("hex");

      console.log(
        `[new] on ${rabbitMQ.queueName} -> ${hashHeader(payloadMessageHash)}`
      );

      running = true;

      console.log(`[processing] -> ${hashHeader(payloadMessageHash)}`);

      try {
        await worker(payloadMessage);
        channel.ack(message);
        console.log(`[success] -> ${hashHeader(payloadMessageHash)}`);
      } catch (error: any) {
        console.error(
          `[error] on ${rabbitMQ.queueName} -> ${error.message} -> ${hashHeader(
            payloadMessageHash
          )}`
        );
        channel.reject(message, false);
      } finally {
        running = false;
      }
    }
  );
}
