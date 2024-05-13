# **T11 - Booking Validator**

## **Description**
Booking Validator is one of the components of the Dentistimo system. Dentistimo allows users to view and book dentist appointments in the city of Gothenburg. More information is found [here](https://github.com/litvem/T11_Project_Documentation).

This component is triggered by incoming booking requests sent from users using the [GUI component](https://github.com/litvem/T11_Web_Application). The Booking validator works as a load balancer for the booking request process while ensuring that no unintentional duplicate appointments are stored and reduces the recurring failures. The booking requests are forwarded to the [DB Model Handler component](https://github.com/litvem/T11_Database_Model_Handler). When a response is received from the DB Model handler, the next booking is sent. Depending on the response, an email confirmation is sent to the respective user. 

### **<ins>Responsibility</ins>**

- Forward valid booking requests prioritized by issuance to the DB Model Handler
- Send an email confirmation to the user
- Balance the booking request load in the system
- Reduce recurring failures 

### **<ins>Fault Tolerance and overload</ins>**
The component implements a load balancer in the form of a min heap priority queue for the booking request, decreasing the overload of the system, combined with a circuit breaker, which is triggered when the queue is at maximum capacity.
When there is a high load in the components and load balancer is at maximun capacity, the circuit breaker enters an open state for 4 seconds. The circuit breaker half-open state has been modified in this component. Instead of verifying that the next request is successful, the half-open state checks if the min heap priority queue is at the specified threshold capacity level, setup at 60%. If the queue size is above the specified threshold capacity, the breaker enters the open state again, and if the queue size is less or equal to the specified threshold capacity, the breaker enters the closed state instead.
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

> Eclipse Mosquitto broker <br>[Download here](https://mosquitto.org/download/)

> NodeJS <br>[Download here](https://nodejs.org/en/download/)

> Javascript IDE<br> *Some alternatives:* [Visual Studio Code](https://visualstudio.microsoft.com/downloads/) , [WebStorm](https://www.jetbrains.com/webstorm/download/)


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
|To configure the email confirmation:<br>Create a file *.env* in the **root folder** and add the following variables<br><br>**Note:** if you dont want to configure the email confirmation, it's required to  use `@test` when providing an email  |`SERVICE="hotmail" `<br> **Note :** *gmail can have issues, so use hotmail which is the service of hotmail or outlook emails.* <br>`EMAIL="<email of the service>"`<br>`PASSWORD="<password>"`|
|To run the proof of concept automated test|  `npm test`|
|To run the component |  `npm run start`|
<br>
 
## **Test instructions**
> * Fault tolerance

The purpose of the test is to show the different states of the circuit breaker and provides information about the time, in seconds, it takes for the circuit breaker to be triggered depending on the request sent every X milliseconds. The variable X depends on the value given to `REQUEST_INTERVAL`. The variable is set up to send a request every 30 milliseconds.

To run this test make sure to have the Booking validator and the [DB Model Handler](https://github.com/litvem/T11_Database_Model_Handler) running. To see the reaction in the browser, the whole system is require. Follow the instruction in  [Documentation repo](https://github.com/litvem/T11_Project_Documentation)


> * Stress test 

This is a stress test to see how long the booking request process takes in a millisecond when the system is being loaded with a request every 200 milliseconds, i.e., 5 requests per second. The number of requests per second can be modified in the method test. 

To run this test the Booking Validator and the [DB Model Handler](https://github.com/litvem/T11_Database_Model_Handler) are required.


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
