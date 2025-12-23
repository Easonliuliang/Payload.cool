import matter from 'gray-matter'

export interface Post {
  slug: string
  title: string
  date: string
  description: string
  author: string
  content: string
}

export function getAllPosts(): Post[] {
  const modules = import.meta.glob('../posts/*.md', { query: '?raw', import: 'default', eager: true })
  
  const posts = Object.entries(modules).map(([path, content]) => {
    // gray-matter works in browser but sometimes requires Buffer. 
    // If it fails, we might need a simpler parser, but let's try standard way first.
    // For simple frontmatter, we can also use a simple regex if gray-matter is too heavy/buggy in browser.
    
    try {
        const { data, content: markdownContent } = matter(content)
        const slug = path.split('/').pop()?.replace('.md', '') || ''
        
        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          description: data.description || '',
          author: data.author || 'Payload.cool',
          content: markdownContent
        }
    } catch (e) {
        console.error("Error parsing markdown:", e)
        return {
            slug: 'error',
            title: 'Error Parsing Post',
            date: '',
            description: '',
            author: '',
            content: 'Error parsing content'
        }
    }
  })
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | undefined {
  const posts = getAllPosts()
  return posts.find(post => post.slug === slug)
}
