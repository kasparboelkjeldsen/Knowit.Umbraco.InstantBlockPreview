import cache from "memory-cache";

export default function Preview({searchParams}) {
    const key = (searchParams?.key).replaceAll('"', "") || "";
    const store = cache.get(key);

    const item = store.items[0]?.content;
    cache.del(key);
    
    return <>
        <strong>I come from an NextJS app!</strong>
        <pre>{JSON.stringify(item, null, 2)}</pre>
    </>
    
}