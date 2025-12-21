import { useParams, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getPostBySlug } from '../lib/posts'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export function BlogPost() {
  const { slug } = useParams()
  const post = slug ? getPostBySlug(slug) : undefined

  useEffect(() => {
    if (post) {
        document.title = `${post.title} - Payload.cool`
    }
    return () => {
        document.title = 'Payload.cool - Privacy-First JSON Formatter'
    }
  }, [post])

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <article className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/blog" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blog
        </Link>
        
        <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <time>{post.date}</time>
                <span>•</span>
                <span>{post.author}</span>
            </div>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
