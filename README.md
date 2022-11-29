# **T11 - Booking Validator**

## **Descripton**
Booking Validator is one of the component of the Dentistimo system. Dentistimo allows users to view and book dentist appointment in the city of Gothenburg. More information is found [here](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-project).

This components is triggered by incomming booking request send from users using the [GUI component](). The Booking validator works as a load balancer for the booking request while ensuring that no unintentional duplicate appointments stored and reduce the recurring failres. The booking request are forward to the [DB Model Handler component](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-database-model-handler). When a response is received from the DB Model handler the next booking is send and depending of the response an email confimation is send to the respective user.

### **<ins>Responsability</ins>**

- Forward booking request prioritized by inssuance to the DB Model Handler
- Send an email confimation
- Balance the booking request load in the system
- Reduce recurring failures 

## **Data flow**

The component **<ins>input data</ins>** are both booking request and booking reponse. The booking request are also the **<ins>output data</ins>** of this components since it forwards them to the DB Model Handler.

>Example Booking Request
```
{
  "userid": 12345,
  "requestid": 13,
  "dentistid": 1,
  "issuance": 1602406766314,
  "date": "2020-12-14",
  "name": "Peter",
  "email": "example@mail.com"
}
```

>Example Booking Response
```
{
  "userid": 12345,
  "requestid": 13,
  "date": "2020-12-14",
  "time": "9:30" # alt "none" if failed,
  "name": "Peter",
  "email": "example@mail.com"
}
```

## **Tools**

>  Eclipse Mosquitto broker <br>[Download here](https://mosquitto.org/download/)

>NodeJS <br>[Download here](https://nodejs.org/en/download/)

>Javascript IDE<br> *Some alternatives:* [Visual Studio Code](https://visualstudio.microsoft.com/downloads/) , [WebStorm](https://www.jetbrains.com/webstorm/download/)


For MacOS:
> HomeBreq<br> [Download](https://brew.sh/index_sv)

### Libraries
* [ NPM ](https://www.npmjs.com/)
* [ MQTT.js ](https://www.npmjs.com/package/mqtt)
* [ Opossum ](https://nodeshift.dev/opossum/)
* [ Nodemailer ](https://nodemailer.com/about/)
* [ Min-priority queue library](https://www.npmjs.com/package/@datastructures-js/priority-queue)


### **<ins>Instructions</ins>**

| Description | Command |
|-------|---|
| Go to mosquitto root folder and open ***mosquitto.conf***| Add the following:<br> `listener 1883 `<br>  `protocol mqtt `<br> `listener 9001 `<br> `protocol websockets  `<br> ` allow_anonymous true`|
| Clone this repository | <ins>Option 1.</ins><br> Download as a zip file<br> <ins>Option 2.</ins><br>`git clone git@git.chalmers.se:courses/dit355/dit356-2022/t-11/t11-booking-validator.git`|
| Open terminal and navigate to mosquitto root folder | Windows: `mosquitto -c mosquitto.conf -v `<br> MacOS: `brew services start mosquitto` |
|Open the repo in javascript IDE and open the terminal in the IDE. Navigate to the server folder | `npm install` |
|Create a file *.env* in the **server folder** and add the following variables<br><br> |`MY_EMAIL="<your email>"` <br>`SERVICE="hotmail" `<br> **Note :** gmail can have issues, so use hotmail which is the service of hotmail or outlook emails.)<br>`EMAIL="<email of the service>"`<br>`PASSWORD="<password>"`|
<br>

## **Common errors**
> ### <ins> Mosquitto port already in use</ins>
>1. Open terminal as administrator
>2. run:
```
netstat -ano | findstr "1883"
```
>3. Note four digit number after "listening"
>4. Replace the XXXX with the four digit number from above and run:
```
taskkill /F /PID XXXX
``` 
>5. Restart Moquitto
