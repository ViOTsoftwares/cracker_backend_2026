import "./src/config/env.js";
import app from "./src/app.js";
import { connectDB } from "./src/config/DB.js";
import { ENV } from "./src/config/env.js";
import { seedCMSPages } from "./src/config/seedCms.js";

const PORT = ENV.PORT;

connectDB().then(async () => {
  await seedCMSPages();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
