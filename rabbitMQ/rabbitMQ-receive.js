/* eslint-disable no-shadow */
/* eslint-disable import/no-extraneous-dependencies */

/* ----- IMPORT ------ */
const amqp = require('amqplib/callback_api');
const Event = require('events');

/* ----- Initialized variables ------ */
process.env.CLOUDAMQP_URL = 'amqp://localhost';
const amqpURL = 'amqp://obablkhe:vN3l2Lpj5sfUcstYJp1oQsHnR-I_0bHZ@toad.rmq.cloudamqp.com/obablkhe';
const emit = new Event();

/* ----- Incoming data stored in arrays ------ */
const data = [];
const predictions = [];

/* ----- Supporting functions ------ */
// Close the connection on errors
const closeOnErr = (err, connection) => {
  if (!err) return false;
  console.error('[AMQP] error', err);
  connection.close();
  return true;
};

// Processes the message
const processMsg = async (msg) => {
  const receivedMsg = await JSON.parse(msg.content.toString());

  // Receiving predictions
  if (receivedMsg.predictions) {
    if (
      // Receiving predictions from state estimation (only unknown)
      (receivedMsg['app-id'] === 'StateEstimation' && receivedMsg.predictions.state === 'unknown') ||
      // Receiving predictions from prediction generator (true and false)
      receivedMsg['app-id'] === 'PredictionGenerator'
    ) {
      setTimeout(function () {
        emit.emit('newPrediction', receivedMsg);
      }, 500);
    }
  }
  // Receiving cognitive load from state estimation
  else if (receivedMsg['belief-state-changes']['cognitive-load']) {
    setTimeout(function () {
      emit.emit('newCognitiveLoad', receivedMsg);
    }, 500);
  }

  // Might be useful in the future
  // if (data.length > 200) {
  //   const deleteItems = data.length - 200; // limits array to hold only 10 records
  //   data.splice(0, deleteItems);
  // }
  // if (predictions.length > 200) {
  //   const deleteItems = data.length - 200; // limits array to hold only 10 records
  //   data.splice(0, deleteItems);
  // }
};

// Opens a topic change and consumes incoming messages
const consumeMessages = async (channel, exchange, routingKeys, connection) => {
  // 1. Opens a topic exchange
  channel.assertExchange(exchange, 'topic', { durable: false });

  // 2. Creates a temporary queue, which is automatically deleted when job done
  // queue is the respond consist of : { queue: 'randome-name', messageCount: 0, consumerCount: 0}
  channel.assertQueue('', { durable: true }, (err, queue) => {
    if (closeOnErr(err, connection)) return;

    // 3. Binds temporary queue to exchange
    routingKeys.forEach((key) => {
      channel.bindQueue(queue.queue, exchange, key); // bindQueue(queue, source, pattern, [args])
    });

    // 4. Consumes messages
    channel.consume(queue.queue, processMsg, {
      noAck: true,
    });
    console.log('[*] Waiting for messages:');
  });
};

// Opens a channel in the established connection & starts consuming messages
const establishChannel = (connection, exchange, routingKeys) => {
  connection.createChannel((err, channel) => {
    // Handles errors
    if (closeOnErr(err, connection)) return;

    channel.on('error', function (err) {
      console.error('[AMQP] channel error', err.message);
    });

    channel.on('close', function () {
      console.log('[AMQP] channel closed');
    });

    // establishes channel
    channel.prefetch(10); // How many messages are being sent to the consumer at the same time.

    consumeMessages(channel, exchange, routingKeys, connection);
  });
};

/* ----- Establishes a connection to RabbitMQ & starts listening ------ */
const start = async (exchange, routingKeys) => {
  // 1. Establishes connection
  amqp.connect(`${process.env.CLOUDAMQP_URL}`, async (err, connection) => {
    // Error handling
    if (err) {
      console.error('[AMQP] starting to connect error', err.message);
      return setTimeout(start, 1000); // try to reconnect
    }
    connection.on('error', function (err) {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] connection error', err.message);
      }
    });
    connection.on('close', function () {
      console.error('[AMQP] reconnecting');
      return setTimeout(start, 1000); // try to reconnect
    });

    // Set up amqp Connection
    console.log('[AMQP] connected');

    // 2. starts listening
    establishChannel(connection, exchange, routingKeys);
  });
};

/* -----  Testing purpose ------ */
// const exchangeName = 'rita';
// const routingKeys = ['belief-state-changes', 'predictions', 'dog', 'cat']; // belief-state-changes
// start(exchangeName, routingKeys);

/* -----  Exports ------ */
module.exports.startListening = start;
module.exports.dataArray = data;
module.exports.predictionArray = predictions;
module.exports.emit = emit;
