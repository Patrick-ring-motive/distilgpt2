self. Context = (()=>{
  const $cache = Symbol('*cache');
  const _seen = {};
  return class Context{

  constructor(name){
    name = `context-${name}`;
    this[$cache] = caches.open(`context-${name}`);
    this[$cache].name = `context-${name}`;
    (async()=>{
      this[$cache] = await this[$cache];
      this[$cache].name = `context-${name}`;
    })();
   }

   async append(token){
     let cache = this[$cache];
     if(cache instanceof Promise){
      cache = await cache;
     }
     token = encodeURIComponent(token)
     let timeKey = new Date().getTime();
     const seen = _seen[timeKey]||0;
     _seen[timeKey] = seen+1;
     timeKey += (seen*0.001);
     return cache.put(`${location.origin}/token/${timeKey}`,new Response(null,{headers:{
token,
timeKey
}}));
   }

    async list(){
      let cache = this[$cache];
     if(cache instanceof Promise){
      cache = await cache;
     }

     const matches = (await cache.matchAll())??[];
     const list = matches.map(val=>[+String(val?.headers?.get?.("timeKey")),String(val?.headers?.get?.('token')??"")]);
      return list.sort((a,b)=>a[0]-b[0]).map(x=>decodeURIComponent(x[1])).filter(x=>x);
    }

async clear() {
  const name = (await this[$cache]).name;
  return caches.delete(name);
}

  };
})();