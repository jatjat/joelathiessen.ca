# Joel Thiessen's Website

This repository contains a front-end for the [kaly2 project](https://github.com/jatjat/kaly2), my resume, and other content.

The website is implemented as a responsive single-page-app using Typescript, React, and Node.js. It was previously written in ES6+.

Todo: obtain better separation of concerns using Redux.

To build the production docker image, execute `docker build . -t joelathiessen.ca`
To run the local development version of this website, execute the following commands in separate termanal windows and then open `localhost:8080` in a browser:

```
cd webapp
yarn install
yarn watch
```

```
cd server
yarn install
yarn watch
```

```
cd server
yarn start
```
