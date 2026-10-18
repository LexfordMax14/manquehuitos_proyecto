import app from "./app.ts";
import config from "./utils/config.ts";
import logger from "./utils/logger.ts";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

app.listen(Number(config.PORT), config.HOST, () => {
  logger.info(`Server running on http://${config.HOST}:${config.PORT}`);
});
