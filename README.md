# HatSpin: LittleBits + node.js

HatSpin is an example of using the [LittleBits CloudKit](https://littlebits.cc/kits/cloudbit-starter-kit) and node.js to bridge the web and physical devices. 

![LittleBits CloudKit](http://i.imgur.com/8yMKqze.png)

## Setup

This sample does require the [LittleBits CloudKit](https://littlebits.cc/kits/cloudbit-starter-kit). After cloning the repository, you need to need to get a few keys in place.  Start by renaming `_secrets.json` to `secrets.json`. 

### Littlebits 

Log into the [LittleBits Cloud Console](http://control.littlebitscloud.cc/).  Click on the `settings` tab, and copy your `Device ID` and `AccessToken` into `secrets.json`:

![LittleBits Cloud Console](http://i.imgur.com/2ORbOz0.png)

Now the circuit.  I'm using the w20 cloud bit, and a simple dc motor to create some spin.  You could really use any output circuit here.  Play around with it, and so something fun!

![Circuit](http://i.imgur.com/NlV5wmG.jpg)


### Redis

The code uses [redis](http://redis.io/) to store the number of clicks, working towards 100 to set off the device.  I used a free [RedisLabs](https://redislabs.com/) database.  After you have that setup, copy the host and port into `secrets.json`.

### PubNub

The code uses [PubNub](https://www.pubnub.com/) to provide scalable realtime communication between clients and the server.  This is convenient if your web host does not support websockets natively. You need the publish key and subscribe key in your `secrets.json`:

![PubNub dashboard](http://i.imgur.com/3qlF2VB.png)

## Running the code

After `secrets.json` is in good shape, just run with:

```
npm start
```

Next, hit [http://localhost:8080](http://localhost:8080) in your browser.  Keep on clicking the button!  Once you hit 100 clicks, the circuit will start to go.  

## Deployment

This code is built as a demo for running [Node.js on Google Cloud](https://cloud.google.com/nodejs), but you can run it anywhere that node.js works.  

1. Create a project in the [Google Cloud Platform Console](https://console.cloud.google.com/).
1. [Enable billing](https://console.cloud.google.com/project/_/settings) for your project.
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/).
1. Deploy it with `gcloud preview app deploy`


## License
[MIT License](LICENSE.md)

## Questions?
Feel free to submit an issue on the repository, or find me at [@JustinBeckwith](http://twitter.com/JustinBeckwith)






