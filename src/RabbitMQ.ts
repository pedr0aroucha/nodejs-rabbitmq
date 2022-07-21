import amqp, { Channel, ConsumeMessage, Options, Connection } from 'amqplib';

export default class RabbitMQ {
	private rabbitSettings = {
		protocol: 'amqp',
		hostname: process.env.RABBITMQ_HOST || 'localhost',
		port: 5672,
		username: process.env.RABBITMQ_USER_NAME || 'admin',
		password: process.env.RABBITMQ_PASSWORD || 'admin',
		vhost: '/',
		authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL'],
	};

	public queueName: string;

	private connection: Connection;

	private static channel: Channel;

	private channelSettings: Options.AssertQueue = {
		durable: true,
		deadLetterExchange: 'dead-letter-exchange',
		deadLetterRoutingKey: 'dlx-routing-key',
	};

	private messageSettings: Options.Publish = {
		persistent: true,
	};

	constructor({ queueName }: { queueName: string }) {
		this.queueName = queueName;
	}

	public async setup() {
		if (!this.connection) {
			this.connection = await amqp.connect(this.rabbitSettings);
		}

		if (!RabbitMQ.channel) {
			RabbitMQ.channel = await this.connection.createChannel();
		}

		const deadLetterExchange = await RabbitMQ.channel.assertExchange(
			'dead-letter-exchange',
			'topic',
			{
				durable: true,
			},
		);
		await RabbitMQ.channel.assertQueue('dead-letter-queue', {
			durable: true,
		});
		await RabbitMQ.channel.bindQueue(
			'dead-letter-queue',
			deadLetterExchange.exchange,
			'dlx-routing-key',
		);

		return RabbitMQ.channel;
	}

	public async sendToQueue(message: string) {
		const channel = await this.setup();
		await channel.assertQueue(this.queueName, this.channelSettings);

		channel.sendToQueue(
			this.queueName,
			Buffer.from(message),
			this.messageSettings,
		);
	}

	public async consumeFromQueue(
		callback: (message: ConsumeMessage | null, channel: Channel) => void,
	) {
		const channel = RabbitMQ.channel;
		await channel.assertQueue(this.queueName, this.channelSettings);

		await channel.prefetch(1);

		await channel.consume(
			this.queueName,
			(message: ConsumeMessage | null) =>
				callback(message, RabbitMQ.channel),
		);
	}
}
