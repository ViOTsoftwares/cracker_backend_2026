import "./src/config/env.js";
import app from "./src/app.js";
import { connectDB } from "./src/config/DB.js";
import { renderEmailTemplate } from "./src/lib/mailTemplate.js";
import { ENV } from "./src/config/env.js";

const PORT = ENV.PORT
// renderEmailTemplate("OTP_VERIFICATION",
//   "vignesh2003rajendran@gmail.com",
//   { USER_NAME: "vignesh", OTP_CODE: 12367, EXPIRY_MINUTES: 3 });

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
