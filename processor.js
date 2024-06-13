const {connectToQueue} = require("./utils");
const {TASK_QUEUE_NAME, RESULT_QUEUE_NAME} = require("./const");

const transitionMatrix = {
    'A': { 'A': 0.1, 'B': 0.6, 'C': 0.3 }, // From Sunny to Sunny, Cloudy, Rainy probability
    'B': { 'A': 0.4, 'B': 0.2, 'C': 0.4 }, // From Cloudy to Sunny, Cloudy, Rainy probability
    'C': { 'A': 0.5, 'B': 0.3, 'C': 0.2 }  // From Rainy to Sunny, Cloudy, Rainy probability
};

async function main() {
    const connection = await connectToQueue()

    const channel = await connection.createChannel();
    const queue = 'TaskQueue';
    await channel.assertQueue(TASK_QUEUE_NAME, { durable: false });

    function simulateMarkovChain(state, steps) {
        let currentState = state;
        for (let i = 0; i < steps; i++) {
            const probabilities = transitionMatrix[currentState];
            const states = Object.keys(probabilities);
            const nextState = getNextState(states, probabilities);

            console.log(" [x] %s/%s %s transits to %s", i + 1, steps, state, nextState);

            currentState = nextState;
        }
        return currentState;
    }

    function getNextState(states, probabilities) {
        const rand = Math.random();
        let cumulativeProbability = 0;
        for (const state of states) {
            cumulativeProbability += probabilities[state];
            if (rand < cumulativeProbability) {
                return state;
            }
        }
        return states[states.length - 1]; // Return the last state if no other state is selected
    }

    async function sendResult(state) {
        const channel = await connection.createChannel();
        await channel.assertQueue(RESULT_QUEUE_NAME, { durable: false });

        channel.sendToQueue(RESULT_QUEUE_NAME, Buffer.from(state));
        console.log(" [x] Sent %s", state);
    }


    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async (msg) => {
        const task = JSON.parse(msg.content.toString());
        const finalState = simulateMarkovChain(task.state, task.steps);
        console.log(finalState)
        await sendResult(finalState);
    }, { noAck: true });
}

main()