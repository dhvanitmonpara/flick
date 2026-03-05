import cache from "@/infra/services/cache";
import collegeCacheKeys from "./college.cache-keys";

type InvalidateCollegeCacheOptions = {
  collegeId?: string;
  previousEmailDomain?: string | null;
  nextEmailDomain?: string | null;
};

export async function invalidateCollegeCaches(options: InvalidateCollegeCacheOptions = {}) {
  const ops: Array<Promise<unknown>> = [cache.incr(collegeCacheKeys.listVersionKey())];

  if (options.collegeId) {
    ops.push(cache.del(collegeCacheKeys.id(options.collegeId)));
  }

  if (options.previousEmailDomain) {
    ops.push(cache.del(collegeCacheKeys.emailDomain(options.previousEmailDomain)));
  }

  if (
    options.nextEmailDomain &&
    options.nextEmailDomain !== options.previousEmailDomain
  ) {
    ops.push(cache.del(collegeCacheKeys.emailDomain(options.nextEmailDomain)));
  }

  await Promise.all(ops);
}
