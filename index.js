const {connectToQueue} = require("./utils");
const {TASK_QUEUE_NAME} = require("./const");

async function main() {
    const connection = await connectToQueue()

    async function sendTask(state, steps) {

        const channel = await connection.createChannel();
        await channel.assertQueue(TASK_QUEUE_NAME, { durable: false });
        channel.sendToQueue(TASK_QUEUE_NAME, Buffer.from(JSON.stringify({ state, steps })));
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