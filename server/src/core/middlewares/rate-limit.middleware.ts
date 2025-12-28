import { limiters } from "@/infra/services/rate-limiter/rl.module";
import { createRateLimiterMiddleware as create } from "@/infra/services/rate-limiter/rl.create-middleware";

const authRateLimiter = create(limiters.auth);
const apiRateLimiter = create(limiters.api);

export default { apiRateLimiter, authRateLimiter };
