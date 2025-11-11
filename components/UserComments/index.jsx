import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Card, CardContent, CardMedia, Grid } from '@mui/material';
import axios from 'axios';

import './styles.css';

function UserComments() {
  const { userId } = useParams();
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserComments = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:3001/user/${userId}`);
        setUser(userResponse.data);

        const usersResponse = await axios.get('http://localhost:3001/user/list');
        const allUsers = usersResponse.data;

        const userComments = [];

        const photoPromises = allUsers.map(otherUser => axios.get(`http://localhost:3001/photosOfUser/${otherUser._id}`)
          .then(photosResponse => photosResponse.data)
          .catch(() => [])
        );

        const allPhotos = await Promise.all(photoPromises);

        allPhotos.forEach(photos => {
          photos.forEach(photo => {
            if (photo.comments) {
              photo.comments.forEach(comment => {
                if (comment.user._id === userId) {
                  userComments.push({
                    ...comment,
                    photo: {
                      _id: photo._id,
                      file_name: photo.file_name,
                      user_id: photo.user_id
                    }
                  });
                }
              });
            }
          });
        });

        setComments(userComments);
      } catch (error) {
        console.error('Error fetching user comments:', error);
      }
    };

    fetchUserComments();
  }, [userId]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Comments by {user.first_name} {user.last_name}
      </Typography>

      {comments.length === 0 ? (
        <Typography>No comments yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {comments.map((comment) => (
            <Grid item xs={12} sm={6} md={4} key={comment._id}>
              <Card>
                <Link to={`/photos/${comment.photo.user_id}`} style={{ textDecoration: 'none' }}>
                  <CardMedia
                    component="img"
                    image={`/images/${comment.photo.file_name}`}
                    alt="Photo thumbnail"
                    style={{ height: 200, objectFit: 'cover', cursor: 'pointer' }}
                  />
                </Link>
                <CardContent>
                  <Typography variant="caption" color="textSecondary">
                    {formatDateTime(comment.date_time)}
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: '8px' }}>
                    {comment.comment}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}

export default UserComments;