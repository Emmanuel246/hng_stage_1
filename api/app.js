// const express = require('express');
// const axios = require('axios');
// const app = express();
// const PORT = process.env.PORT || 3000;
// const requestIp = require('request-ip');

// app.use(requestIp.mw());

// app.get('/api/hello', async (req, res) => {
//  let visitorName = req.query.visitor_name || 'Guest';
//   visitorName = visitorName.replace(/["']/g, "");

//   // Get client IP address
//   const clientIp = req.headers['x-real-ip'] || req.socket.remoteAddress;
//   console.log(clientIp);

//   try {
//     // Use an IP geolocation API to get location
//     const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
//     if (locationResponse.data.status !== 'success') {
//       throw new Error('Location not found');
//     }

//     const location = locationResponse.data.city || 'your city';

//     // Use a weather API to get the current temperature
//     const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather`, {
//       params: {
//         q: location,
//         units: 'metric',
//         appid: '182ab95d87d5c82a1006ca1a31da03c1'
//       }
//     });

//     if (weatherResponse.data.cod !== 200) {
//       throw new Error('Weather data not found');
//     }

//     const temperature = weatherResponse.data.main.temp;

//     res.json({
//       client_ip: clientIp,
//       location: location,
//       greeting: `Hello,` + visitorName + `!, the temperature is ${temperature} degrees Celsius in ${location}`
//     });
//   } catch (error) {
//     console.error(error);

//     res.json({
//       client_ip: clientIp,
//       location: 'unknown',
//       greeting: `Hello, ${visitorName}!, the temperature data is not available`
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



const express = require("express");
const axios = require("axios");
const { lookup } = require("geoip-lite");

const app = express();

app.get("/api/hello", (req, res) => {
  let clientIp = (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    ""
  )
    .split(",")[0]
    .trim();
  clientIp = clientIp.split(":").pop();
  console.log(clientIp);
  const geo = lookup(clientIp);
  console.log(geo);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${geo.ll[0]}&lon=${geo.ll[1]}&units=metric&appid=182ab95d87d5c82a1006ca1a31da03c1`;

  axios({ url }).then(({ data }) => {
    console.log({ data });
    if (req.query.visitor_name) {
      return res.send({
        client_ip: clientIp,
        location: geo.city,
        greeting: `Hello, ${req.query.visitor_name}!, the temperature is ${data.main.temp} degrees Celsius in ${geo.city}`,
      });
    }
    return res.send({
      client_ip: clientIp,
      location: geo.city,
      greeting: `Hello, Visitor!, the temperature is ${data.main.temp} degrees Celsius in ${geo.city}`,
    });
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
