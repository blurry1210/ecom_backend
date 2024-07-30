const config = require("./src/utlis/config");
const app = require("./src/app");

app.listen(config.PORT, () =>
  console.log(`✅ Auth-service running on port ${config.PORT}.`)
);
