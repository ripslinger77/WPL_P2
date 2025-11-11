import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import './styles.css';

function TopBar({ advancedFeaturesEnabled, onToggleAdvancedFeatures }) {
  const [contextText, setContextText] = useState('PhotoShare App');
  const location = useLocation();

  useEffect(() => {
    const updateContext = async () => {
      const pathParts = location.pathname.split('/');
      const routeType = pathParts[1];
      const userId = pathParts[2];

      if (!userId || (routeType !== 'users' && routeType !== 'photos' && routeType !== 'photo')) {
        setContextText('PhotoShare App');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        const user = response.data;
        const userName = `${user.first_name} ${user.last_name}`;

        if (routeType === 'users') {
          setContextText(userName);
        } else if (routeType === 'photos' || routeType === 'photo') {

          setContextText(`Photos of ${userName}`);
        } else {
          setContextText('PhotoShare App');
        }
      } catch (error) {
        console.error('Error fetching user for TopBar:', error);
        setContextText('PhotoShare App'); 
      }
    };

    updateContext();
  }, [location.pathname]); 

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
          Sriman Sathish
        </Typography>

        <FormControlLabel
          control={(
            <Checkbox
              checked={advancedFeaturesEnabled || false}
              onChange={onToggleAdvancedFeatures}
              style={{ color: 'white' }}
            />
          )}
          label="Enable Advanced Features"
          style={{ color: 'white', marginRight: '16px' }}
        />

        <Typography variant="h6" color="inherit">
          {contextText}
        </Typography>

      </Toolbar>
    </AppBar>
  );
}

export default TopBar;