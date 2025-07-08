import { getBasePath } from '../src/lib/utils/url-normalization';

/**
 * Links list for posts. This example assumes an array of post objects
 * with `slug` and `title` properties will be provided. The base path
 * from next.config.js (or environment) is automatically prefixed to
 * each link.
 */
export default function PostsIndex({ posts = [] }) {
  const basePath = getBasePath();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <a href={`${basePath}/blog/${post.slug}`}>{post.title}</a>
        </li>
      ))}
    </ul>
  );
}
