export default async function Page({ params }) {
    const { newsId } = await params;

    return <div>News Page: {newsId}</div>;
}