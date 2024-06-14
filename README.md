# Markov chains example

This repository contains example of transitions in Markov's chains with usage RabbitMQ message broker. Docker compose configuration included

## Structure
* index.js - script that produces items with states A, B and C and sends them to TaskQueue.
* processor.js - script that process items in TaskQueue and sends results to ResultQueue.
* aggregator.js - script that consumes results in ResultQueue and aggregates them.