import { Link } from 'react-router-dom'
import { getAllPosts } from '../lib/posts'
import { ArrowLeft } from 'lucide-react'

export function BlogList() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Tool
            </Link>
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Updates, tutorials, and insights from the Payload.cool team.</p>
        </div>

        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.slug} className="group">
              <Link to={`/blog/${post.slug}`} className="block p-6 bg-white dark:bg-[#18181b] rounded-lg border dark:border-zinc-800 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <time>{post.date}</time>
                    <span>•</span>
                    <span>{post.author}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">{post.description}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
