import cache from "@/infra/services/cache";

const collegeCacheKeys = {
  id: (id: string) => `college:id:${id}`,
  emailDomain: (emailDomain: string) => `college:emailDomain:${emailDomain}`,
  listVersionKey: () => `college:list:version`,
  branches: (collegeId: string) => `college:branches:${collegeId}`,
  all: async (filters?: { city?: string; state?: string }) => {
    const version = (await cache.get<number>(`college:list:version`, { bypassL1: true })) || 1;
    return `college:all:v${version}:${filters?.city || 'all'}:${filters?.state || 'all'}`;
  },
};

export default collegeCacheKeys
