import { Link, useLoaderData } from '@remix-run/react';

export const loader = () => {
  const data = {
    posts: [
      {
        id: 1,
        title: 'Post 001',
        body: 'This is a test post 1',
      },
      {
        id: 2,
        title: 'Post 002',
        body: 'This is a test post 2',
      },
      {
        id: 3,
        title: 'Post 003',
        body: 'This is a test post 3',
      },
    ],
  };

  return data;
};

function PostItems() {
  const { posts } = useLoaderData();

  return (
    <>
      <div>
        <div className="page-header">
          <h1>Posts:</h1>
          <Link to="/posts/new" className="btn">
            New Post
          </Link>
        </div>
        <ul className="posts-list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link to={post.id}>
                <h3>{post.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default PostItems;
