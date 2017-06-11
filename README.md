# dviide-framework
Dviide is a javascript mitm/xss framework built in node.js with easily writable modules.

## Installation

To initialize the server and listeners:
```bash
npm install dviide
-- or --
git clone https://github.com/idiidk/dviide-framework.git
cd dviide-framework
npm install
node backend.js
```

A file called config.json is located at the root of the repository, edit this file first to provide the ip of your server. To infect clients inject the inject.js file into their browser. You will then see a connection on the backend.

## Modules

Remember I was talking about modules? Well they are easy to write and implement. Some sample modules can be found in the /dviide/modules folder. The basics of a module are:

1. A ```this.name``` string - This just specifies the module name called back to the server.
2. A ```this.start``` function() - This function is called when the module is injected.

To return data to the server call:
```
//More callback types coming soon...
dviide.callbackText('data');
```
If you want access to things such as the ip and port of the server just take a look at the dviide class in inject.js.

## Commands

Do you want to write your own custom commands? Well you can! A command consists of the following functions:

1. A ```this.prefix``` string - This is what will be typed to call your command.
2. A ```this.call``` function(args, mh) - This is the function that will be called upon execution of your module. The args variable conatins an array with the arguments passed to your module. The mh variable contains a ModuleHelper object to interface with the framework. To learn more about this object you should take a look at the backend class for the ModuleHelper.

## Servers and Listeners
By default the backend listens on port 3000 for incoming client connections. It also runs a small webserver on port 3030 which just serves the inject.js file.
