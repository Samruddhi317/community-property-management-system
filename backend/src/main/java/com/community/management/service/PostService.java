
package com.community.management.service;

import com.community.management.entity.Comment;
import com.community.management.entity.Post;
import com.community.management.entity.User;
import com.community.management.exception.ResourceNotFoundException;
import com.community.management.repository.CommentRepository;
import com.community.management.repository.PostRepository;
import com.community.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public Post getById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Post not found: " + id));
    }

    public Post create(Post post) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Logged-in user not found"));

        post.setAuthor(user);
        return postRepository.save(post);
    }

    public Comment addComment(Long postId, Comment comment) {
        Post post = getById(postId);

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Logged-in user not found"));

        comment.setPost(post);
        comment.setAuthor(user);

        return commentRepository.save(comment);
    }

    // Edit Post
    public Post updatePost(Long id, Post updatedPost) {
        Post existingPost = getById(id);

        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setBody(updatedPost.getBody());

        return postRepository.save(existingPost);
    }

    // Delete Post
    public void deletePost(Long id) {
        Post post = getById(id);
        postRepository.delete(post);
    }
}
