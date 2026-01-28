import axios from 'axios';
import routes from './router.js'; // Import your route definitions

// Function to extract permissions
const extractPermissions = (routes) => {
  const permissions = [];

  routes.forEach((route) => {
    if (route.meta && route.meta.controller && route.meta.method) {
      permissions.push({
        controller: route.meta.controller,
        method: route.meta.method,
      });
    }

    // Check for child routes if applicable
    if (route.children) {
      permissions.push(...extractPermissions(route.children));
    }
  });

  return permissions;
};

// Send permissions to the backend
const sendPermissionsToBackend = async () => {
  const permissions = extractPermissions(routes);

  try {
    const response = await axios.post('/api/permissions/update', { permissions });
    console.log('Permissions updated:', response.data);
  } catch (error) {
    console.error('Error updating permissions:', error);
  }
};

// Trigger the function to send permissions
sendPermissionsToBackend();

