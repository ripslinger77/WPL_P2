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
          const counts = {};
          for (const user of response.data) {
            try {
              const photosResponse = await axios.get(`http://localhost:3001/photosOfUser/${user._id}`);
              const photos = photosResponse.data;
              
              counts[user._id] = {
                photoCount: photos.length,
                commentCount: 0
              };
              
              const allUsersResponse = await axios.get('http://localhost:3001/user/list');
              let commentCount = 0;
              
              for (const otherUser of allUsersResponse.data) {
                try {
                  const otherPhotosResponse = await axios.get(`http://localhost:3001/photosOfUser/${otherUser._id}`);
                  const otherPhotos = otherPhotosResponse.data;
                  
                  otherPhotos.forEach(photo => {
                    if (photo.comments) {
                      photo.comments.forEach(comment => {
                        if (comment.user._id === user._id) {
                          commentCount++;
                        }
                      });
                    }
                  });
                } catch (err) {
                  // No photos
                }
              }
              
              counts[user._id].commentCount = commentCount;
            } catch (error) {
              counts[user._id] = { photoCount: 0, commentCount: 0 };
            }
          }
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