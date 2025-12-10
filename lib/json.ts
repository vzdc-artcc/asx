export const fetchJson = async (key: string) => {
    const res = await fetch(`https://utfs.io/f/${key}`, {
        next: {
            revalidate: 60 * 60 * 24, // 5 minutes
        }
    });
    return await res.json();
}