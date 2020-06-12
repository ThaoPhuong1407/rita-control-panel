# RITA Control Panel

### Step to run the Control Panel locally:

1. Make sure you have NodeJS and NPM installed: <br> [How to install NodeJS and NPM using Brew](https://dyclassroom.com/howto-mac/how-to-install-nodejs-and-npm-on-mac-using-homebrew)
2. Make sure you have rabbitmq installed and running in the background: `rabbitmqctl status`
3. Download and save this repo locally on your working laptop / PC
4. Open the terminal and go to `rita-control-panel-master` directory
5. Do a `npm install`. This command will install all needed dependencies automatically.
6. Do a `npm start` or `node server.js`
7. Open the browser and go to `http://localhost:3000/state-estimation`
8. Run the State Estomation and Prediction Generation components
9. Start sending messages to rabbitmq
10. Check the RITA Control Panel and see changes in Prediction Generator Section and Accuracy Level Graph
