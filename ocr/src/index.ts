import app from "./app";
import "./conf/cors"
import { initWorker } from "./controllers/extract.controller";

const port = process.env.PORT || 8003;

initWorker()
app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
})