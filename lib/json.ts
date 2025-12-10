export const fetchJson = async (key: string) => {
    const res = await fetch(`https://utfs.io/f/${key}`, {
        cache: 'force-cache',
        next: {
            revalidate: 60 * 60,
        }
    });
    return await res.json();
}