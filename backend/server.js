import connectDB from "./config/db.js";
import { server } from "./app.js";

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
