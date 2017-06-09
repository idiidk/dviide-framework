# dviide-framework
Dviide is a javascript mitm/xss framework built in node.js with easily writable modules.

## Installation

To initialize the server and listeners:
```bash
git clone https://github.com/idiidk/dviide-framework.git
cd dviide-framework
npm install
node backend.js
```

A file called inject.js is located at the root of the repository, edit this file first to provide the ip of your server. To infect clients inject this file into their browser. You will then see a connection on the backend.

## Modules

Remember I was talking about modules? Well they are easy to write and implement. Some sample modules can be found in the dviide_modules folder. The basics of a module are:

1. A ```this.name``` function - This just specifies the module name called back to the server.
2. A ```this.start``` function - This function is called when the module is injected.

To return data to the server call:
```
dviide.callback('data');
```

If you want access to things such as the ip and port of the server just take a look at the dviide class in inject.js.

## Servers and Listeners
By default the backend listens on port 3000 for incoming client connections. It also runs a small webserver on port 3030 which just serves the inject.js file.
