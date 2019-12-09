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

function saveToExcel(file) {
  var wb = xlsx.readFile("Data.xlsx");
  var ws = wb.Sheets[wb.SheetNames[0]];
  let data = [];
  client.connect(err => {
    const collection = client.db("IOT").collection("wemosd1");
    collection.find({}).toArray((a, result) => {
      data = result.map(item => [item.time, item.temperatureDHT, item.temperatureBMP]);
      console.log(data);
      xlsx.utils.sheet_add_aoa(ws, data, {origin: -1});
      console.log(ws);
      xlsx.writeFile(wb, "Data1.xlsx");
    })
  })
};

//saveToExcel("Data.xlsx");
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  client.connect(err => {
    console.log("Connected successfully to server");
    const collection = client.db("IOT").collection("wemosd1");
    new CronJob(
      "*/20 * * * * *",
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
          })
        });
      },
      null,
      true,
      "Asia/Ho_Chi_Minh"
    );
    //client.close();
  });
});
