'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface ArticleRendererProps {
  content: string
}

export default function ArticleRenderer({ content }: ArticleRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlight
      ]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-medium mt-5 mb-2 text-gray-800" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-base leading-relaxed mb-4 text-gray-700" {...props} />
        ),
        a: ({ node, ...props }) => (
          <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="ml-2" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600" {...props} />
        ),
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm text-red-600 font-mono" {...props} />
          ) : (
            <code className="block bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm font-mono" {...props} />
          ),
        pre: ({ node, ...props }) => (
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border-collapse border border-gray-300" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="border-b border-gray-200" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 last:border-r-0" {...props} />
        ),
        hr: ({ node, ...props }) => (
          <hr className="my-6 border-gray-300" {...props} />
        ),
        img: ({ node, ...props }) => (
          <img className="rounded-lg my-4 max-w-full h-auto" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
