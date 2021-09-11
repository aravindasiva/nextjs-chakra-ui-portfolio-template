import { readFileSync, readdirSync } from "fs"
import matter from "gray-matter"
import path from "path"
import readingTime from "reading-time"
import renderToString from "next-mdx-remote/render-to-string"
import remarkSlug from "remark-slug"

import MDXComponents from "@/components/MDXComponents"

const root = process.cwd()

export async function getFiles(type) {
  return readdirSync(path.join(root, "src/data", type))
}

export async function getFileBySlug(type, slug) {
  const source = slug
    ? readFileSync(path.join(root, "src/data", type, `${slug}.mdx`), "utf8")
    : readFileSync(path.join(root, "src/data", `${type}.mdx`), "utf8")

  const { data, content } = matter(source)
  const mdxSource = await renderToString(content, {
    components: MDXComponents,
    mdxOptions: {
      remarkPlugins: [remarkSlug, require("remark-code-titles")],
    },
  })

  return {
    mdxSource,
    frontMatter: {
      wordCount: content.split(/\s+/gu).length,
      readingTime: readingTime(content),
      slug: slug || null,
      ...data,
    },
  }
}

export async function getAllFilesFrontMatter(type) {
  const files = readdirSync(path.join(root, "src/data", type))

  return files.reduce((allPosts, postSlug) => {
    const source = readFileSync(
      path.join(root, "src/data", type, postSlug),
      "utf8"
    )
    const { data } = matter(source)

    return [
      {
        ...data,
        slug: postSlug.replace(".mdx", ""),
      },
      ...allPosts,
    ]
  }, [])
}