const axios = require('axios');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const FormData = require('form-data');

// Function to extract v-permission directive data from the Vue file
function extractPermissionData(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const permissionRegex = /v-permission:([^\s>]+)/g;
  const permissions = [];
  let match;

  // Loop through all matches of v-permission directive
  while ((match = permissionRegex.exec(fileContent)) !== null) {
    const method = match[1]; // The value of the v-permission directive
    const controllerPath = convertPathToController(filePath);

    permissions.push({
      controller: controllerPath,
      method: method
    });
  }

  return permissions;
}

// Function to convert Vue file path to controller format
function convertPathToController(filePath) {
  // Example: src/views/Page/Permission/Permission.vue -> Permission/PermissionController
  const fileName = path.basename(filePath, '.vue');
  const dirPath = path.dirname(filePath);
  const parts = dirPath.split(path.sep);
  const controller = parts.slice(-1).join('/');

  return `${controller}/${fileName}`;
}

// Function to process all Vue files and send permissions
function processVueFiles() {
  // Search for all Vue files in the src/views directory
  glob('src/views/**/*.vue', (err, files) => {
    if (err) {
      console.error('Error reading files:', err);
      return;
    }

    const allPermissions = [];

    files.forEach((filePath) => {
      const permissions = extractPermissionData(filePath);
      allPermissions.push(...permissions);
      // Transform into the desired format and send to API
	// sendPermissionsToAPI(permissionsToSend);
    });

    // Group permissions by controller
    const groupedPermissions = groupPermissionsByController(allPermissions);

    // Transform into the desired format and send to API
    const permissionsToSend = formatPermissions(groupedPermissions);
    sendPermissionsToAPI(permissionsToSend);
  });
}

// Function to group permissions by controller
function groupPermissionsByController(permissions) {
  const grouped = {};

  permissions.forEach((permission) => {
    const { controller, method } = permission;
    if (!(controller in grouped)) {
      grouped[controller] = [];
    }
    if (!grouped[controller].includes(method)) {
      grouped[controller].push(method);
    }
  });

  return grouped;
}

// Function to format permissions into desired structure
function formatPermissions(groupedPermissions) {
  const formattedPermissions = {};

  for (let controller in groupedPermissions) {
    const parts = controller.split("/");
    const name = parts[parts.length - 2]; // Extracting the directory name as 'name'
    const controllerParts = controller.split("/");
    const controllerName = controllerParts[parts.length - 1]; // Get the last item

    if (!(name in formattedPermissions)) {
      formattedPermissions[name] = { name, controllers: {} };
    }

    if (!(controllerName in formattedPermissions[name].controllers)) {
      formattedPermissions[name].controllers[controllerName] = ["index", "show", "store", "update", "destroy", "exportDataToExcell", "fetchFileData", "storeFileData", "updateOrCreate"];
    }

    // Merge actions, avoiding duplicates
    formattedPermissions[name].controllers[controllerName].push(
      ...groupedPermissions[controller].filter(
        (action) => !formattedPermissions[name].controllers[controllerName].includes(action)
      )
    );
  }

  // Convert the object into an array
  return Object.values(formattedPermissions);
}

// Function to send permissions to the API
async function sendPermissionsToAPI(permissions) {
  console.log(permissions);
  try {
    const response = await axios.post(
      'https://grc-backend.pksaudi.work.gd/api/permission',
	    {"directives": permissions}
    );

    console.log('Permissions successfully sent:', response.data);
  } catch (error) {
    console.error('Error sending permissions:', error.response ? error.response.data : error.message);
  }
}

// Run the script
processVueFiles();

