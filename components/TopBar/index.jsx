import React from 'react';
import { AppBar, Toolbar, Typography, FormControlLabel, Checkbox } from '@mui/material';

import './styles.css';

function TopBar({ advancedFeaturesEnabled, onToggleAdvancedFeatures }) {
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
          style={{ color: 'white' }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;