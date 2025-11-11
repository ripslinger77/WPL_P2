import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Button, Box } from '@mui/material';
import axios from 'axios';

import './styles.css';

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        // const response = await axios.get(`/user/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user details');
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) return <Typography>Loading user details...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!user) return <Typography>User not found</Typography>;

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Location:</strong> {user.location}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Occupation:</strong> {user.occupation}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Description:</strong> {user.description}
          </Typography>
          <Button 
            component={Link} 
            to={`/photos/${user._id}`}
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
          >
            View Photos
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default UserDetail;