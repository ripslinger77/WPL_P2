import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Typography, Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import axios from 'axios';

import './styles.css';

function UserPhotos({ advancedFeaturesEnabled }) {
  const { userId, photoIndex } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/photosOfUser/${userId}`);
        setPhotos(response.data);
        
        if (photoIndex !== undefined) {
          setCurrentIndex(parseInt(photoIndex, 10));
        } else {
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, [userId, photoIndex]);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrevious = () => {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    navigate(`/photo/${userId}/${newIndex}`);
  };

  const handleNext = () => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    navigate(`/photo/${userId}/${newIndex}`);
  };

  if (photos.length === 0) {
    return <Typography>Loading photos...</Typography>;
  }

  // Advanced Features: Show single photo with stepper
  if (advancedFeaturesEnabled) {
    const photo = photos[currentIndex];
    
    return (
      <div style={{ padding: '20px' }}>
        <Card style={{ marginBottom: '30px', maxWidth: '800px' }}>
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt="User photo"
            style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
          />
          
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Photo {currentIndex + 1} of {photos.length} - Uploaded: {formatDateTime(photo.date_time)}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
              <Button
                variant="contained"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← Previous
              </Button>
              <Typography variant="body2">
                {currentIndex + 1} / {photos.length}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={currentIndex === photos.length - 1}
              >
                Next →
              </Button>
            </Box>

            {photo.comments && photo.comments.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Typography variant="h6" style={{ marginTop: '15px', marginBottom: '10px' }}>
                  Comments
                </Typography>
                
                {photo.comments.map((comment) => (
                  <div key={comment._id} style={{ marginBottom: '15px' }}>
                    <Typography variant="body2">
                      <Link 
                        to={`/users/${comment.user._id}`}
                        style={{ fontWeight: 'bold', textDecoration: 'none', color: '#1976d2' }}
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      {' '}
                      <span style={{ color: '#666', fontSize: '0.9em' }}>
                        ({formatDateTime(comment.date_time)})
                      </span>
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: '5px', marginBottom: '10px' }}>
                      {comment.comment}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Show all photos (original view)
  return (
    <div style={{ padding: '20px' }}>
      {photos.map((photo) => (
        <Card key={photo._id} style={{ marginBottom: '30px', maxWidth: '800px' }}>
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt="User photo"
            style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
          />
          
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Uploaded: {formatDateTime(photo.date_time)}
            </Typography>

            {photo.comments && photo.comments.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <Typography variant="h6" style={{ marginTop: '15px', marginBottom: '10px' }}>
                  Comments
                </Typography>
                
                {photo.comments.map((comment) => (
                  <div key={comment._id} style={{ marginBottom: '15px' }}>
                    <Typography variant="body2">
                      <Link 
                        to={`/users/${comment.user._id}`}
                        style={{ fontWeight: 'bold', textDecoration: 'none', color: '#1976d2' }}
                      >
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      {' '}
                      <span style={{ color: '#666', fontSize: '0.9em' }}>
                        ({formatDateTime(comment.date_time)})
                      </span>
                    </Typography>
                    <Typography variant="body1" style={{ marginTop: '5px', marginBottom: '10px' }}>
                      {comment.comment}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

UserPhotos.propTypes = {
  advancedFeaturesEnabled: PropTypes.bool.isRequired,
};

export default UserPhotos;