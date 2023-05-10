# Getting started

Obtain invite from Kyle for the github


Install Node.JS on your device if not done so already

Install expo globally on your machine: 
```npm install expo-cli --global```


Install the Amplify CLI tools using the following command:  
```curl -sL https://aws-amplify.github.io/amplify-cli/install | bash && $SHELL```

Restart shell. Confirm that expo is installed:
```expo --help```

* If this does not work, try npx expo --help


Install the Expo Go app on your device


Clone the github repo to your local machine, cloning the dev branch


Install dependencies for the project using the following command, ensuring that you are in the path with the package.json file:
```sudo yarn install```

Pull the Amplify credentials using the following command: 
```amplify pull --appId d1hvc4yve37x56 --envName dev```


Run the following command to start the Expo dev server locally:
```sudo expo start```
* If this does not work, try sudo npx expo start


Using the camera app on your phone, scan the QR code that is available, and ensure that you can open it using the Expo Go application you installed earlier 

Obtain invite for AWS Amplify Console from Kyle and login, to be able to create new models and view the content for the application.
 