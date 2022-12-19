# **T11 - Booking Validator**

## **Descripton**
Booking Validator is one of the component of the Dentistimo system. Dentistimo allows users to view and book dentist appointment in the city of Gothenburg. More information is found [here](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-project).

This components is triggered by incomming booking request send from users using the [GUI component](). The Booking validator works as a load balancer for the booking request process while ensuring that no unintentional duplicate appointments are stored and reduce the recurring failres. The booking request are forward to the [DB Model Handler component](https://git.chalmers.se/courses/dit355/dit356-2022/t-11/t11-database-model-handler). When a response is received from the DB Model handler the next booking is send and depending of the response an email confimation is send to the respective user. 

### **<ins>Responsability</ins>**

- Forward valid booking request prioritized by inssuance to the DB Model Handler
- Send an email confimation to the user
- Balance the booking request load in the system
- Reduce recurring failures 

### **<ins>Fault Tolerance and overload</ins>**
The components implements a min heap priority queue for the booking request, decreasing the overload of the system, combined with a circuit breaker which is triggered when the queue is at maximun capacity. 
When there is a high load in the components and the failure rate is at 10% the circuit breaker enters an open state during 30 seconds. The circuit breaker half-open state has been modified in this component. Instead of verifying that the next request is succesful the half-open state checks if the min heap priority queue is at specified threhold capacity level. If the queue size is above the specified threhold capacity the breaker enter the open state again and if the queue size is under the specified threhold capacity the breaker enter to a close state instead. 
More theoretical information about the circuit breaker pattern is found [here](https://martinfowler.com/bliki/CircuitBreaker.html).

## **Data flow**

The component **<ins>input data</ins>** are both booking request and booking reponse. The booking request are also the **<ins>output data</ins>** of this components since it forwards them to the DB Model Handler.

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
| Clone this repository | <ins>Option 1.</ins><br> Download as a zip file<br> <ins>Option 2.</ins><br>`git clone git@git.chalmers.se:courses/dit355/dit356-2022/t-11/t11-booking-validator.git`|
| Open terminal and navigate to mosquitto root folder | Windows: `mosquitto -c mosquitto.conf -v `<br> MacOS: `brew services start mosquitto` |
|Open the repo in javascript IDE and open the terminal in the IDE. Navigate to the server folder | `npm install` |
|Create a file *.env* in the **server folder** and add the following variables<br><br> |`MY_EMAIL="<your email>"` *(Used for testing)* <br>`SERVICE="hotmail" `<br> **Note :** *gmail can have issues, so use hotmail which is the service of hotmail or outlook emails.* <br>`EMAIL="<email of the service>"`<br>`PASSWORD="<password>"`|
|To run the automated test|  `npm test`|
|To run the component |  `npm run controller`|
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
