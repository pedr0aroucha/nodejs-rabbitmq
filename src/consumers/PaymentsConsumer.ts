import { consumerFactory } from "./_factory";

import RabbitMQ from "../RabbitMQ";

interface IPaymentPayload {}

export default class PaymentsConsumer {
  public static async start() {
    await consumerFactory(
      new RabbitMQ({ queueName: "payments" }),
      async function name(paymentPayload: IPaymentPayload) {
        console.log(paymentPayload);
      }
    );
  }
}
