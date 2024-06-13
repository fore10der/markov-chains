const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://rmuser:rmpassword@localhost');

    async function sendTask(state, steps) {

        const queue = 'TaskQueue';

        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify({ state, steps })));
        console.log(" [x] Sent %s", JSON.stringify({ state, steps }));
        await channel.close();
    }

    const initialStates = ['A', 'B', 'C']; // A: Sunny, B: Cloudy, C: Rainy
    const steps = 10;
    initialStates.forEach(state => sendTask(state, steps));

    setTimeout(() => {
        connection.close();
    }, 500);
}

main()