import React, { useState, useEffect } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

import './styles.css';

function UserList({ advancedFeaturesEnabled }) {
  const [users, setUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/user/list');
        setUsers(response.data);

        if (advancedFeaturesEnabled) {
          const photoPromises = response.data.map(user => axios.get(`http://localhost:3001/photosOfUser/${user._id}`)
              .then(photosResponse => ({ userId: user._id, photos: photosResponse.data }))
              .catch(() => ({ userId: user._id, photos: [] }))
          );
          
          const allUsersPhotos = await Promise.all(photoPromises);
          
          const counts = {};
          
          allUsersPhotos.forEach(({ userId, photos }) => {
            counts[userId] = {
              photoCount: photos.length,
              commentCount: 0
            };
          });
          
          allUsersPhotos.forEach(({ photos }) => {
            photos.forEach(photo => {
              if (photo.comments) {
                photo.comments.forEach(comment => {
                  const commenterId = comment.user._id;
                  if (counts[commenterId]) {
                    counts[commenterId].commentCount++;
                  }
                });
              }
            });
          });
          
          setUserCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };

    fetchUsers();
  }, [advancedFeaturesEnabled]);

  return (
    <div>
      <Typography variant="h6" style={{ padding: '10px' }}>
        Users
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <div key={user._id}>
            <ListItem button component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              
              {advancedFeaturesEnabled && userCounts[user._id] && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge 
                    badgeContent={userCounts[user._id].photoCount} 
                    color="success"
                    style={{ marginRight: '4px' }}
                  />
                  
                  <Link 
                    to={`/comments/${user._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: 'none' }}
                  >
                    <Badge 
                      badgeContent={userCounts[user._id].commentCount} 
                      color="error"
                    />
                  </Link>
                </div>
              )}
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
}

export default UserList;