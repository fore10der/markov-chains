const amqp = require("amqplib");

async function connectToQueue() {
    return await amqp.connect('amqp://rmuser:rmpassword@localhost')
}

module.exports = {
    connectToQueue
}