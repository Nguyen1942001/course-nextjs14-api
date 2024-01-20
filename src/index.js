const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const YAML = require("yaml");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const file = fs.readFileSync(path.resolve("./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);
const schedule = require("node-schedule");
const { autoUpdateDiscounts } = require("./services/ProductService");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

routes(app);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect Db success!");
  })
  .catch((err) => {
    console.log(err);
  });

schedule.scheduleJob("0 0 * * *", () => {
  autoUpdateDiscounts();
});

app.listen(port, () => {
  console.log("Server is running in port: ", +port);
});
