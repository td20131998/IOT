const http = require("http");
var CronJob = require("cron").CronJob;
const xlsx = require("xlsx");
const axios = require("axios");
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://td20131998:du0ng1357@iot-v0kbm.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true,  useUnifiedTopology: true });

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World\n");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  client.connect(err => {
    console.log("Connected successfully to server");
    const collection = client.db("IOT").collection("wemosd1");
    new CronJob(
      "*/10 * * * * *",
      function() {
        console.log("Job running every 10s");
        axios.get("https://dweet.io:443/get/latest/dweet/for/myesp8266_td20131998_8888")
        .then(res => {
          let data = {
            time: res.data.with[0].created,
            temperatureDHT: res.data.with[0].content.temperature,
            temperatureBMP: res.data.with[0].content.temperature_bmp,
            humidity: res.data.with[0].content.humidity
          };
          collection.insertOne(data, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            // db.close();
          })
          // sheet1.cell(`A${startAt}`).value(time);
          // sheet1.cell(`B${startAt}`).value(data.temperature);
          // sheet1.cell(`C${startAt}`).value(data.temperature_bmp);
          // startAt++;
          // console.log(data);
        });
      },
      null,
      true,
      "Asia/Ho_Chi_Minh"
    );
    //client.close();
  });

  // XlsxPopulate.fromFileAsync("./Data.xlsx").then(workbook => {
  //   // Modify the workbook.
  //   let startAt = 1;
  //   const sheet1 = workbook.sheet("Sheet1");
  //   for(let i = 1;;i++) {
  //       if (!sheet1.row(i).cell("A").value()) {
  //           startAt = i;
  //           break;
  //       }
  //   }
  //   console.log(startAt);
  // });
});
