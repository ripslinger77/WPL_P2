import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Paper } from '@mui/material';
import {
  BrowserRouter, Route, Routes, useParams,
} from 'react-router-dom';

import './styles/main.css';
// Import mock setup - Remove this once you have implemented the actual API calls
// import './lib/mockSetup.js';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import UserComments from './components/UserComments';

function UserDetailRoute({ advancedFeaturesEnabled }) {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} advancedFeaturesEnabled={advancedFeaturesEnabled} />;
}

function UserPhotosRoute({ advancedFeaturesEnabled }) {
  const { userId } = useParams();
  return <UserPhotos userId={userId} advancedFeaturesEnabled={advancedFeaturesEnabled} />;
}

function UserListRoute({ advancedFeaturesEnabled }) {
  return <UserList advancedFeaturesEnabled={advancedFeaturesEnabled} />;
}

function PhotoShare() {
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);

  const handleToggleAdvancedFeatures = () => {
    setAdvancedFeaturesEnabled(!advancedFeaturesEnabled);
  };

  return (
    <BrowserRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar 
              advancedFeaturesEnabled={advancedFeaturesEnabled}
              onToggleAdvancedFeatures={handleToggleAdvancedFeatures}
            />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserListRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/users/:userId" element={<UserDetailRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />} />
                <Route path="/photos/:userId" element={<UserPhotosRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />} />
                <Route path="/photo/:userId/:photoIndex" element={<UserPhotosRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />} />
                <Route path="/comments/:userId" element={<UserComments />} />
                <Route path="/users" element={<UserListRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<PhotoShare />);
