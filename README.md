# **T11 - Booking Validator**

## **Description**
Booking Validator is one of the components of the Dentistimo system. Dentistimo allows users to view and book dentist appointments in the city of Gothenburg. More information is found [here](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-project).

This component is triggered by incoming booking requests sent from users using the [GUI component](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-web-application). The Booking validator works as a load balancer for the booking request process while ensuring that no unintentional duplicate appointments are stored and reduces the recurring failures. The booking requests are forwarded to the [DB Model Handler component](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-database-model-handler). When a response is received from the DB Model handler, the next booking is sent. Depending on the response, an email confirmation is sent to the respective user. 

### **<ins>Responsibility</ins>**

- Forward valid booking requests prioritized by issuance to the DB Model Handler
- Send an email confirmation to the user
- Balance the booking request load in the system
- Reduce recurring failures 

### **<ins>Fault Tolerance and overload</ins>**
The component implements a min heap priority queue for the booking request, decreasing the overload of the system, combined with a circuit breaker, which is triggered when the queue is at maximum capacity.
When there is a high load in the components and the failure rate is at 1%, the circuit breaker enters an open state for 4 seconds. The circuit breaker half-open state has been modified in this component. Instead of verifying that the next request is successful, the half-open state checks if the min heap priority queue is at the specified threshold capacity level. If the queue size is above the specified threshold capacity, the breaker enters the open state again, and if the queue size is under the specified threshold capacity, the breaker enters the closed state instead.
More theoretical information about the circuit breaker pattern is found [here](https://martinfowler.com/bliki/CircuitBreaker.html).

## **Data flow**

Both the booking requests and the booking responses are the **<ins>input data</ins>** of the component. The booking requests are also the **<ins>output data</ins>** of this component, since the component forwards the booking requests to the DB Model Handler.

>Example Booking Request
```
{
  "userid": "example@mail.com",
  "requestid": 13,
  "dentistid": 1,
  "issuance": 1602406766314,
  "date": "2020-12-14",
  "time": "9:30-10:00",
  "name": "Peter",
  "sessionId":"5355QPITzxL9-tGW1yOUMITYwIYk4Vdz"
}
```

>Example Booking Response
```
{
  "userid": "example@mail.com",
  "requestid": 13,
  "date": "2020-12-14",
  "time": "9:30-10:00",
  "name": "Peter",
  "sessionId": "5355QPITzxL9-tGW1yOUMITYwIYk4Vdz",
  "dentistid": 1
}
```

## **Tools**

>  Eclipse Mosquitto broker <br>[Download here](https://mosquitto.org/download/)

>NodeJS <br>[Download here](https://nodejs.org/en/download/)

>Javascript IDE<br> *Some alternatives:* [Visual Studio Code](https://visualstudio.microsoft.com/downloads/) , [WebStorm](https://www.jetbrains.com/webstorm/download/)


For MacOS:
> HomeBrew<br> [Download](https://brew.sh/index_sv)

### Libraries
* [ NPM ](https://www.npmjs.com/)
* [ MQTT.js ](https://www.npmjs.com/package/mqtt)
* [ Opossum ](https://nodeshift.dev/opossum/)
* [ Nodemailer ](https://nodemailer.com/about/)
* [ Min-priority queue library](https://www.npmjs.com/package/@datastructures-js/priority-queue)


### **<ins>Instructions</ins>**

| Description | Command |
|-------|---|
| Clone this repository | <ins>Option 1.</ins><br> Download as a zip file<br> <ins>Option 2.</ins><br>`git clone git@git.chalmers.se:courses/dit355/dit356-2022/t-11/t11-booking-validator.git`|
| Open terminal and navigate to mosquitto root folder | Windows: `mosquitto -c mosquitto.conf -v `<br> MacOS: `brew services start mosquitto` |
|Open the repo in javascript IDE and open the terminal in the IDE. Navigate to the server folder | `npm install` |
|Create a file *.env* in the **root folder** and add the following variables<br><br> |`MY_EMAIL="<your email>"` *(Used for testing)* <br>`SERVICE="hotmail" `<br> **Note :** *gmail can have issues, so use hotmail which is the service of hotmail or outlook emails.* <br>`EMAIL="<email of the service>"`<br>`PASSWORD="<password>"`|
|To run the proof of concept automated test|  `npm test`|
|To run the component |  `npm run start`|
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
>5. Restart Mosquitto
