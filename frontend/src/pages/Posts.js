import React, { useEffect, useState } from 'react';
import {
  getPosts,
  createPost,
  addComment,
  updatePost,
  deletePost
} from '../services/api';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentTexts, setCommentTexts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const loadPosts = async () => {
    try {
      const { data } = await getPosts();
      const parsedData =
        typeof data === 'string' ? JSON.parse(data) : data;

      setPosts(Array.isArray(parsedData) ? parsedData : []);
      setError('');
    } catch (err) {
      console.error('Load posts error:', err);
      setError('Could not load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) return;

    try {
      await createPost({
        title: title.trim(),
        body: content.trim()
      });

      setTitle('');
      setContent('');
      setSuccess('Post created successfully!');
      await loadPosts();
    } catch (err) {
      console.error('Create post error:', err);
      setError('Could not create post. Please try again.');
    }
  };

  const handleAddComment = async (postId) => {
    const body = commentTexts[postId]?.trim();

    if (!body) return;

    setError('');
    setSuccess('');

    try {
      await addComment(postId, { body });

      setCommentTexts((prev) => ({
        ...prev,
        [postId]: ''
      }));

      setSuccess('Comment added successfully!');
      await loadPosts();
    } catch (err) {
      console.error('Add comment error:', err);
      setError('Could not add comment. Please try again.');
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title || '');
    setEditBody(post.body || '');
    setError('');
    setSuccess('');
  };

  const handleUpdatePost = async (e, postId) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editTitle.trim() || !editBody.trim()) return;

    try {
      await updatePost(postId, {
        title: editTitle.trim(),
        body: editBody.trim()
      });

      setEditingPostId(null);
      setEditTitle('');
      setEditBody('');
      setSuccess('Post updated successfully!');

      await loadPosts();
    } catch (err) {
      console.error('Update post error:', err);
      setError('Could not update post. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditBody('');
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await deletePost(postId);
      setSuccess('Post deleted successfully!');
      await loadPosts();
    } catch (err) {
      console.error('Delete post error:', err);
      setError('Could not delete post. Please try again.');
    }
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 15px',
    marginBottom: '14px',
    background: '#191921',
    color: '#F4F4F5',
    border: '1px solid #525269',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    colorScheme: 'dark'
  };

  const primaryButton = {
    padding: '12px 18px',
    background: 'linear-gradient(100deg, #7C3AED, #8B5CF6)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer'
  };

  const secondaryButton = {
    padding: '11px 16px',
    background: '#353044',
    color: '#DDD6FE',
    border: '1px solid #5B4B7A',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  };

  const dangerButton = {
    ...secondaryButton,
    background: 'rgba(239, 68, 68, 0.10)',
    color: '#FCA5A5',
    border: '1px solid rgba(239, 68, 68, 0.35)'
  };

  const cardStyle = {
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '15px',
    padding: '22px',
    marginBottom: '18px',
    boxShadow: '0 5px 18px rgba(0,0,0,0.12)',
    color: '#E4E4E7'
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>COMMUNITY SPACE</p>
          <h1 style={styles.heading}>Community Posts</h1>
          <p style={styles.subtitle}>
            Share updates, exchange ideas and stay connected.
          </p>
        </div>

        <div style={styles.countBadge}>
          <span style={styles.countNumber}>{posts.length}</span>
          <span style={styles.countLabel}>Posts</span>
        </div>
      </div>

      {/* Create Post */}
      <section style={styles.createCard}>
        <h2 style={styles.sectionTitle}>Create a Post</h2>
        <p style={styles.helperText}>
          Have something to share with your community?
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="postTitle" style={styles.label}>
            Post Title
          </label>
          <input
            id="postTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your post"
            required
            style={inputStyle}
          />

          <label htmlFor="postContent" style={styles.label}>
            Description
          </label>
          <textarea
            id="postContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your community?"
            required
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />

          <button type="submit" style={primaryButton}>
            + Create Post
          </button>
        </form>
      </section>

      {error && (
        <div style={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div style={styles.successMessage} role="status">
          {success}
        </div>
      )}

      <div style={styles.listHeader}>
        <h2 style={styles.sectionTitle}>Latest Posts</h2>
        <span style={styles.mutedText}>
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} shared
        </span>
      </div>

      {loading && (
        <div style={styles.emptyCard}>
          <p style={styles.mutedText}>Loading community posts...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>✦</div>
          <h3 style={styles.emptyTitle}>No posts yet</h3>
          <p style={styles.mutedText}>
            Be the first to share something with your community!
          </p>
        </div>
      )}

      {/* Posts List */}
      {posts.map((post) => (
        <article key={post.id} style={cardStyle}>
          {editingPostId === post.id ? (
            <form onSubmit={(e) => handleUpdatePost(e, post.id)}>
              <h3 style={styles.sectionTitle}>Edit Post</h3>

              <label htmlFor={`editTitle-${post.id}`} style={styles.label}>
                Post Title
              </label>
              <input
                id={`editTitle-${post.id}`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title"
                required
                style={inputStyle}
              />

              <label htmlFor={`editBody-${post.id}`} style={styles.label}>
                Description
              </label>
              <textarea
                id={`editBody-${post.id}`}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Post content"
                required
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <div style={styles.buttonRow}>
                <button type="submit" style={primaryButton}>
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={styles.postTopLine}>
                <span style={styles.postTag}>COMMUNITY POST</span>
                <span style={styles.postId}>#{post.id}</span>
              </div>

              <h3 style={styles.postTitle}>{post.title}</h3>

              <p style={styles.postBody}>{post.body}</p>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  onClick={() => handleEditClick(post)}
                  style={secondaryButton}
                >
                  Edit Post
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  style={dangerButton}
                >
                  Delete Post
                </button>
              </div>
            </>
          )}

          <div style={styles.authorRow}>
            <div style={styles.avatar}>
              {(post.author?.fullName || post.author?.email || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <p style={styles.authorLabel}>Posted by</p>
              <p style={styles.authorName}>
                {post.author?.fullName ||
                  post.author?.email ||
                  'Unknown User'}
              </p>
            </div>
          </div>

          <div style={styles.commentsSection}>
            <h4 style={styles.commentsHeading}>
              Comments
              <span style={styles.commentCount}>
                {(post.comments || []).length}
              </span>
            </h4>

            {(post.comments || []).length === 0 && (
              <p style={styles.mutedText}>
                No comments yet. Start the conversation!
              </p>
            )}

            {(post.comments || []).map((comment) => (
              <div key={comment.id} style={styles.commentCard}>
                <div style={styles.commentAvatar}>
                  {(comment.author?.fullName ||
                    comment.author?.email ||
                    'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={styles.commentAuthor}>
                    {comment.author?.fullName ||
                      comment.author?.email ||
                      'Unknown User'}
                  </strong>
                  <p style={styles.commentBody}>{comment.body}</p>
                </div>
              </div>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment(post.id);
              }}
              style={styles.commentForm}
            >
              <label
                htmlFor={`comment-${post.id}`}
                style={styles.label}
              >
                Add a comment
              </label>
              <textarea
                id={`comment-${post.id}`}
                value={commentTexts[post.id] || ''}
                onChange={(e) =>
                  setCommentTexts((prev) => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))
                }
                placeholder="Write your comment..."
                required
                rows={2}
                style={{ ...inputStyle, marginBottom: '10px', resize: 'vertical' }}
              />

              <button type="submit" style={primaryButton}>
                Add Comment
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1000px',
    width: '100%',
    boxSizing: 'border-box',
    margin: '0 auto',
    padding: '32px 20px 48px',
    color: '#F4F4F5',
    fontFamily: 'Arial, sans-serif'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '28px'
  },

  eyebrow: {
    margin: '0 0 8px',
    color: '#A78BFA',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px'
  },

  heading: {
    margin: '0 0 10px',
    color: '#F4F4F5',
    fontSize: 'clamp(28px, 4vw, 36px)',
    fontWeight: 750
  },

  subtitle: {
    margin: 0,
    color: '#A1A1AA',
    fontSize: '15px',
    lineHeight: 1.6
  },

  countBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '82px',
    padding: '15px',
    border: '1px solid #5B3AA6',
    borderRadius: '14px',
    background: '#272033'
  },

  countNumber: {
    color: '#C4B5FD',
    fontSize: '28px',
    fontWeight: 750
  },

  countLabel: {
    color: '#C4B5FD',
    fontSize: '12px',
    marginTop: '3px'
  },

  createCard: {
    padding: '24px',
    marginBottom: '32px',
    background: '#27272A',
    border: '1px solid #4C3A70',
    borderRadius: '16px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.12)'
  },

  sectionTitle: {
    margin: '0 0 10px',
    color: '#F4F4F5',
    fontSize: '21px',
    fontWeight: 700
  },

  helperText: {
    margin: '0 0 22px',
    color: '#A1A1AA',
    fontSize: '14px'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#C4B5FD',
    fontSize: '14px',
    fontWeight: 600
  },

  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '18px'
  },

  mutedText: {
    color: '#A1A1AA',
    fontSize: '14px',
    lineHeight: 1.6
  },

  emptyCard: {
    textAlign: 'center',
    padding: '36px 20px',
    marginBottom: '20px',
    background: '#27272A',
    border: '1px dashed #52525B',
    borderRadius: '14px'
  },

  emptyIcon: {
    color: '#A78BFA',
    fontSize: '32px',
    marginBottom: '8px'
  },

  emptyTitle: {
    color: '#F4F4F5',
    fontSize: '19px',
    margin: '0 0 8px'
  },

  postTopLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },

  postTag: {
    display: 'inline-block',
    padding: '6px 10px',
    color: '#C4B5FD',
    background: '#352750',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px'
  },

  postId: {
    color: '#A1A1AA',
    fontSize: '12px'
  },

  postTitle: {
    margin: '0 0 12px',
    color: '#F4F4F5',
    fontSize: '22px',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },

  postBody: {
    margin: '0 0 20px',
    color: '#D4D4D8',
    fontSize: '15px',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  },

  buttonRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '18px'
  },

  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 0',
    borderTop: '1px solid #3F3F46',
    borderBottom: '1px solid #3F3F46'
  },

  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#493278',
    color: '#EDE9FE',
    fontSize: '17px',
    fontWeight: 700
  },

  authorLabel: {
    margin: '0 0 4px',
    color: '#A1A1AA',
    fontSize: '12px'
  },

  authorName: {
    margin: 0,
    color: '#E4E4E7',
    fontSize: '14px',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },

  commentsSection: {
    paddingTop: '20px'
  },

  commentsHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 16px',
    color: '#EDE9FE',
    fontSize: '17px'
  },

  commentCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    padding: '0 5px',
    boxSizing: 'border-box',
    background: '#3B2A5B',
    color: '#DDD6FE',
    borderRadius: '12px',
    fontSize: '12px'
  },

  commentCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '13px',
    marginBottom: '10px',
    background: '#202024',
    border: '1px solid #3F3F46',
    borderRadius: '10px'
  },

  commentAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#3B2A5B',
    color: '#DDD6FE',
    fontSize: '13px',
    fontWeight: 700
  },

  commentAuthor: {
    color: '#C4B5FD',
    fontSize: '13px',
    overflowWrap: 'anywhere'
  },

  commentBody: {
    margin: '7px 0 0',
    color: '#D4D4D8',
    fontSize: '14px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  },

  commentForm: {
    marginTop: '20px',
    padding: '16px',
    background: '#222226',
    border: '1px solid #3F3F46',
    borderRadius: '12px'
  },

  successMessage: {
    padding: '13px 16px',
    marginBottom: '20px',
    background: 'rgba(34, 197, 94, 0.10)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    borderRadius: '10px',
    color: '#86EFAC',
    fontSize: '14px'
  },

  errorMessage: {
    padding: '13px 16px',
    marginBottom: '20px',
    background: 'rgba(239, 68, 68, 0.10)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '10px',
    color: '#FCA5A5',
    fontSize: '14px'
  }
};

export default Posts;