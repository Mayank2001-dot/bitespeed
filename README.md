To run the project : npm start 
To run in development mode : npm run dev
postman api url for local : http://localhost:3000/identify
input json: {
  "email": "three@gmail.com",
  "phoneNumber": "234567"
}

output json : {
    "contact": {
        "primaryContactId": 2,
        "emails": [
            "two@gmail.com",
            "three@gmail.com"
        ],
        "phoneNumbers": [
            "234567",
            "345678"
        ],
        "secondaryContactIds": [
            3
        ]
    }
}
