const {RESULT_QUEUE_NAME} = require("./const");
const {connectToQueue} = require("./utils");
const fs = require('fs');
const path = require('path');

const stateCounts = {};

function updateStateCounts(state) {
    if (!stateCounts[state]) {
        stateCounts[state] = 0;
    }
    stateCounts[state] += 1;
    console.log(stateCounts);
}

const aggregationFilePath = path.join(__dirname, 'aggregation.json');


function writeAggregation() {
    const aggregation = JSON.stringify(stateCounts, null, 2);

    try {
        fs.writeFileSync(aggregationFilePath, aggregation, 'utf8');
        console.log('JSON object written to file.');
    } catch (err) {
        console.error('Failed to write JSON object to file:', err);
    }

    console.log('Cleanup done.');
}

async function main() {
    const connection = await connectToQueue()
    const channel = await connection.createChannel();
    await channel.assertQueue(RESULT_QUEUE_NAME, { durable: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", RESULT_QUEUE_NAME);
    channel.consume(RESULT_QUEUE_NAME, async (msg) => {
        const state = msg.content.toString();
        updateStateCounts(state);
    }, { noAck: true });

    process.on('SIGINT', () => {
        writeAggregation()
        connection.close();
        process.exit()
    })
    process.on('SIGTERM', () => {
        writeAggregation()
        connection.close();
        process.exit()
    })
}

main().catch(console.warn);
