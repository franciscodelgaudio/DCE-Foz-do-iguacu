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
        <div className="mx-auto w-full max-w-[850px] px-6 py-12 md:px-10">
            <header className="mb-8 space-y-3">
                {newItem?.category ? (
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {newItem.category}
                    </div>
                ) : null}

                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                    {newItem?.title}
                </h1>

                {newItem?.excerpt ? (
                    <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        {newItem.excerpt}
                    </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    {newItem?.author?.name ? <span>{newItem.author.name}</span> : null}
                    {newItem?.publishedAt ? <span>•</span> : null}
                    {newItem?.publishedAt ? (
                        <time dateTime={newItem.publishedAt}>
                            {new Date(newItem.publishedAt).toLocaleDateString('pt-BR')}
                        </time>
                    ) : null}
                </div>

                <div className="h-px w-full bg-slate-200" />
            </header>


            <article
                className="
            prose prose-slate max-w-none
            prose-img:rounded-lg prose-img:shadow
            prose-a:underline prose-a:underline-offset-4
      "
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    )
}
