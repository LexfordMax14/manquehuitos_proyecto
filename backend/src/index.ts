import app from "./app";
import config from "./utils/config";
app.listen(Number(config.PORT), config.HOST, () => {
  console.log(`Servidor en http://${config.HOST}:${config.PORT}`);
});
