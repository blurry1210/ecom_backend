const config = require("./src/utils/config");
const app = require("./src/app");

app.listen(config.PORT, () =>
  console.log(`✅ Products-service running on port ${config.PORT}.`)
);
