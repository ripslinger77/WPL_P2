/**
 * Project 2 Express server connected to MongoDB 'project2'.
 * Start with: node webServer.js
 * Client uses axios to call these endpoints.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ToDO - Your submission should work without this line. Comment out or delete this line for tests and before submission!
// import models from "./modelData/photoApp.js";

// Load the Mongoose schema for User, Photo, and SchemaInfo
// ToDO - Your submission will use code below, so make sure to uncomment this line for tests and before submission!
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const portno = 3001; // Port number to use
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * /test/info - Returns the SchemaInfo object of the database in JSON format.
 *              This is good for testing connectivity with MongoDB.
 */

app.get('/test/info', async function (request, response) {
  try {
    const info = await SchemaInfo.find({});
    if (info.length === 0) {
      return response.status(500).send('Missing SchemaInfo');
    }
    return response.status(200).send(info[0]);
  } catch (error) {
    console.error('Error in /test/info:', error);
    return response.status(500).json(error);
  }
});

/**
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get('/test/counts', async function (request, response) {
  try {
    const userCount = await User.countDocuments({});
    const photoCount = await Photo.countDocuments({});
    const schemaCount = await SchemaInfo.countDocuments({});
    
    const counts = {
      user: userCount,
      photo: photoCount,
      schemaInfo: schemaCount
    };
    
    return response.status(200).send(counts);
  } catch (error) {
    console.error('Error in /test/counts:', error);
    return response.status(500).json(error);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get('/user/list', async function (request, response) {
  try {
    const users = await User.find({}, '_id first_name last_name');
    return response.status(200).send(users);
  } catch (error) {
    console.error('Error in /user/list:', error);
    return response.status(500).json(error);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get('/user/:id', async function (request, response) {
  try {
    const user = await User.findById(
      request.params.id,
      '_id first_name last_name location description occupation'
    );
    
    if (!user) {
      console.log('User with _id:' + request.params.id + ' not found.');
      return response.status(400).send('Not found');
    }

    const userDetails = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation
    };
    
    return response.status(200).send(userDetails);
    
  } catch (error) {
    console.error('Error in /user/:id:', error);
    return response.status(400).send('Invalid user ID');
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get('/photosOfUser/:id', async function (request, response) {
  try {
    const photos = await Photo.find(
      { user_id: request.params.id },
      '_id file_name date_time user_id comments'
    );
    
    if (!photos || photos.length === 0) {
      console.log('Photos for user _id:' + request.params.id + ' not found.');
      return response.status(200).send([]);
    }

    const photosWithUserDetails = await Promise.all(
      photos.map(async (photo) => {
        
        let processedComments = [];
        
        if (photo.comments && photo.comments.length > 0) {
          processedComments = await Promise.all(
            photo.comments.map(async (comment) => {
              const user = await User.findById(comment.user_id, '_id first_name last_name');
              return {
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: {
                  _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name
                }
              };
            })
          );
        }
        
        return {
          _id: photo._id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          user_id: photo.user_id,
          comments: processedComments
        };
      })
    );

    return response.status(200).send(photosWithUserDetails);
  } catch (error) {
    console.error('Error in /photosOfUser/:id:', error);
    return response.status(400).send('Invalid user ID');
  }
});

/**
 * URL /commentsOfUser/:id - Returns all comments made by User (id).
 */
app.get('/commentsOfUser/:id', async function (request, response) {
  try {
    const userId = request.params.id;
    
    // Find all photos that contain at least one comment by the user_id
    const photos = await Photo.find({ "comments.user_id": userId });

    if (!photos || photos.length === 0) {
      return response.status(200).send([]);
    }

    const userComments = [];
    photos.forEach(photo => {
      photo.comments.forEach(comment => {
        if (comment.user_id.toString() === userId) {
          userComments.push({
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: comment.user_id,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
              user_id: photo.user_id
            }
          });
        }
      });
    });

    return response.status(200).send(userComments);

  } catch (error) {
    console.error('Error in /commentsOfUser/:id:', error);
    return response.status(400).send('Invalid user ID');
  }
});

const server = app.listen(portno, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
