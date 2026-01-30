export default async function Page({ params }) {
    const { newsId } = params;

    return <div>News Page: {newsId}</div>;
}