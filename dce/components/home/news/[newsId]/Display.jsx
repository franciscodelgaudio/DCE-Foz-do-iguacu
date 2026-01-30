export function Display({ newItem }) {
    const html = newItem?.contentHtml

    if (!html) {
        return (
            <div className="rounded-md bg-muted p-6 text-sm text-muted-foreground">
                Este artigo não possui conteúdo.
            </div>
        )
    }

    return (
        <article
            className="
        prose prose-slate max-w-none
        prose-img:rounded-lg prose-img:shadow
        prose-a:underline prose-a:underline-offset-4
      "
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
