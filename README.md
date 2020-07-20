# Crisis Assistance (BOT)

[![License](https://img.shields.io/badge/License-Apache2-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0) [![Slack](https://img.shields.io/badge/Join-Slack-blue)](https://callforcode.org/slack) [![Website](https://img.shields.io/badge/View-Website-blue)](https://github.com/dasxran/CallForCode2020_CrisisAssistance)

## Contents

1. [Short description](#short-description)
1. [Demo video](#demo-video)
1. [The architecture](#the-architecture)
1. [Long description](#long-description)
1. [Project roadmap](#project-roadmap)
1. [Getting started](#getting-started)
1. [Running the tests](#running-the-tests)
1. [Live demo](#live-demo)
1. [Built with](#built-with)
1. [Contributing](#contributing)
1. [Versioning](#versioning)
1. [Authors](#authors)
1. [License](#license)
1. [Acknowledgments](#acknowledgments)

## Short description

Crisis Assistance is a BOT ready to help in crisis or disaster related situations. It has access to various data sources and can be interacted via mobile app or website. 

### What's the problem?

As per current situation whole world is threatened by COVID-19. World is fighting against this virus. This is a pandemic situation, not everyone in this world are equally aware of this virus - the do’s and don’ts. COVID-19 definitely crisis, but on top of it there are other crisis getting created by natural disaster. Super cyclone, Earthquake, Flood are some natural calamities happening on every year. We managed those crisis before but now in this CORONA period, situation is much tough. Let’s take a small example – due to recent super cyclone at West Bengal, many trees are uprooted and closed the road. Prior to CORONA, people from disaster management came and cut the trees and clear the path.  During COVID-19, the situation is completely different, here we have to cut the tree keeping social distance. Things become more and more challenging and time consuming. Our Crisis Assistance will play a very vital role here, nearby people will access this app to know alternate way to reach a hospital in case of medical emergency, avoid road where people are more, they can even report that there is road block due to tree falls down.

Let’s think of a different crisis scenario. People live in interior village. Most of them do not have any smart phone, instead of that they have old model phone. Due to flood they lost their house. Tremendous crisis of food. They are completely clueless, how they will communicate with others as they have separated from rest of the world. It’s another type of crisis. Our Crisis Assistance will play a crucial role here. How? People will call helpline number and share their situation and ask for help in their local language. BOT will translate the message to English and share with Nearby People / Government Rescue authority/ NGO who can save them. BOT will share the Geography location at the same time. Benefit, again save those lives.

Another common crisis scenario, an old lady is living alone. She has started fever with throat pain. She does not know what to do next. So first thing he/she will do will open this Crisis Assistance and type the situation. As a result BOT will share Doctors list available for online consultation, medicine home delivery information and nearby Lab details with home sample collection facility.  Yes we can save her even in this crisis situation with right information on right time.

### How can technology help?

Our idea is to put below features in Crisis Assistance:

Ø  Chat Communication feature

Ø  Voice communication feature in Local Language

Ø  Implement “Alert” feature specific to a place based on Weather Forecast or Pandemic situation. This Alert will provide all advisory information to fight against crisis in well advance.

### The idea

We have come up with an idea of a BOT which will work as Crisis Assistance in terms of voice communicator, chat communicator and automated Alert system. This bot will effectively communicate during an emergency situation. This Bot will take place of a doctor sometime, sometime teacher, sometime guardian etc. This Bot will be available in real time. It will be accessible from anywhere. People can communicate with BOT in their native language, BOT will translate them into English while transmitting. This BOT will be able to identify the GEO location and share while transmitting the message. The one and only one intension behind it, is save as much lives as possible.

## Demo video

[![Watch the video](https://github.com/Code-and-Response/Liquid-Prep/blob/master/images/IBM-interview-video-image.png)](https://youtu.be/vOgCOoy_Bx0)

## The architecture

![Video transcription/translation app](https://developer.ibm.com/developer/tutorials/cfc-starter-kit-speech-to-text-app-example/images/cfc-covid19-remote-education-diagram-2.png)

1. The user navigates to the site and uploads a video file.
2. Watson Speech to Text processes the audio and extracts the text.
3. Watson Translation (optionally) can translate the text to the desired language.
4. The app stores the translated text as a document within Object Storage.

## Long description

[More detail is available here](DESCRIPTION.md)

## Project roadmap


## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

```bash
dnf install wget
wget http://www.example.com/install.sh
bash install.sh
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be, for example

```bash
export TOKEN="fffd0923aa667c617a62f5A_fake_token754a2ad06cc9903543f1e85"
export EMAIL="jane@example.com"
dnf install npm
node samplefile.js
Server running at http://127.0.0.1:3000/
```

And repeat

```bash
curl localhost:3000
Thanks for looking at Code-and-Response!
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why, if you were using something like `mocha` for instance

```bash
npm install mocha --save-dev
vi test/test.js
./node_modules/mocha/bin/mocha
```

### And coding style tests

Explain what these tests test and why, if you chose `eslint` for example

```bash
npm install eslint --save-dev
npx eslint --init
npx eslint sample-file.js
```

## Live demo

You can find a running system to test at [callforcode.mybluemix.net](http://callforcode.mybluemix.net/)

## Built with

* [Watson Assistant](https://cloud.ibm.com/catalog/services/watson-assistant) - Used to build conversational interfaces
* [Node-RED](https://cloud.ibm.com/developer/appservice/starter-kits/59c9d5bd-4d31-3611-897a-f94eea80dc9f/nodered) - Used to wiring together flows and services
* [Speech to Text](https://cloud.ibm.com/catalog/services/speech-to-text) - Used to convert human voices into the text
* [IBM Cloudant](https://cloud.ibm.com/catalog?search=cloudant#search_results) - The NoSQL database used
* [Db2](https://cloud.ibm.com/catalog/services/db2) - The SQL database used
* [React Native](https://reactnative.dev/) - The mobile application development framework
* [Google Custom Search](https://developers.google.com/custom-search) - The search engine service
* [Google Maps](https://maps.google.com/) - The web mapping service

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Kanika Dutta** - *Initial work*
* **Ranjan Kumar Das** - *Initial work*

See also the list of [contributors](https://github.com/dasxran/CallForCode2020_CrisisAssistance/graphs/contributors) who participated in this project.

## License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Based on [Billie Thompson's README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2).
