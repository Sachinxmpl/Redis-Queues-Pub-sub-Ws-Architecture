import express from 'express';
import websocket from 'ws';
import { createClient } from 'redis';

const app = express();
const httpServer = app.listen(8080)

const wss = new websocket.Server({ server: httpServer });


const subscriberClient  = createClient({
    url: "redis://localhost:6379"
})
subscriberClient.on('error' , (err) => console.error("Redis client error" , err))

wss.on('connection', function connection(ws: websocket.WebSocket) {
  ws.on('error', console.error);

//   ws.on('message', function message(data, isBinary) {
//     // 1. Convert the received Buffer/ArrayBuffer data to a string.
//     // If it's not binary, it should be treated as UTF-8 text.
//     const messageString = data.toString('utf8'); 

//     wss.clients.forEach(function each(client) {
//       if (client.readyState === WebSocket.OPEN) {
//         // 2. Broadcast the string, not the raw Buffer.
//         // We set binary to false since we know it's a string.
//         client.send(messageString, { binary: false }); 
//       }
//     });
//   });
});


async function startSubscriber(){
    try {
        await subscriberClient.connect()
        console.log("Subscriber connected to redis")

        await subscriberClient.subscribe("processed_submissions" , (message) => {
            console.log("Received message from processed_submissions channel" , message)
            // Broadcast to all connected websocket clients 
            wss.clients.forEach(function each(client) {
                if (client.readyState === websocket.OPEN) {
                  client.send(message, { binary: false }); 
                }
              });
        })

        console.log("Subscribed to processed_submissions channel")

    }catch(err){
        console.error("Failed to connect to redis" , err)
    }
}

startSubscriber()