const config = require("./src/utils/config");
const app = require("./src/app");

app.listen(config.PORT, () =>
  console.log(`✅ Users-service running on port ${config.PORT}.`)
);
