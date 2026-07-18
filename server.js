import "./src/config/env.js";
import app from "./src/app.js";
import { connectDB } from "./src/config/DB.js";
import { ENV } from "./src/config/env.js";
import { seedCMSPages } from "./src/config/seedCms.js";

import http from "http";
import { initSocket } from "./src/config/socket.js";

const PORT = ENV.PORT;
const server = http.createServer(app);
initSocket(server);

connectDB().then(async () => {
  await seedCMSPages();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
