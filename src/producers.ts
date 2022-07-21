import express, { Request, Response } from "express";

import RabbitMQ from "./RabbitMQ";

const app = express();

app.use(express.json());

app.post("/to-queue/:queueName", async (req: Request, res: Response) => {
  const message = JSON.stringify(req.body);
  const queueName = req.params.queueName;

  const rabbitMQAnyQueue = new RabbitMQ({ queueName });

  await rabbitMQAnyQueue.sendToQueue(message);

  return res.json({ message: "successfully queued" });
});

app.get("/status", async (req: Request, res: Response) => {
  new RabbitMQ({ queueName: "test" });

  return res.json({ message: "ok" });
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
