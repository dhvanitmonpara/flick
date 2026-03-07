const userCacheKeys = {
	id: (id: string) => `user:id:${id}`,
	authId: (authId: string) => `user:authId:${authId}`,
	email: (email: string) => `user:email:${email}`,
	username: (u: string) => `user:username:${u}`,
	search: (q: string) => `user:search:${q}`,
};

export default userCacheKeys;
