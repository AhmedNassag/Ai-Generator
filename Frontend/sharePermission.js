const axios = require("axios");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const FormData = require("form-data");
const { exit } = require("process");

const baseURL = "http://82.29.175.67:7070/api";

// Default methods from base API class
const defaultApiMethods = [
  "importFileData",
  "getAll",
  "show",
  "insert",
  "update",
  "CreateOrUpdate",
  "delete",
  "exportAllToExcel",
];

// Function to extract API endpoints and custom permissions from TypeScript files
function extractApiEndpoints(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const className = path.basename(filePath, ".ts");
  const directory = path.basename(path.dirname(filePath));

  // Initialize array to store API methods
  const apiMethods = [...defaultApiMethods]; // Start with default methods

  // Look for custom permissions in constructor
  const constructorRegex = /constructor\(\)[^{]*{[^}]*super\([^)]*\);([^}]*)}/s;
  const constructorMatch = fileContent.match(constructorRegex);

  if (constructorMatch) {
    const constructorBody = constructorMatch[1];
    // Look for custom permissions array assignment
    const customPermissionsMatch = constructorBody.match(
      /this\.customPermissions\s*=\s*(\[[^\]]+\])/
    );
    if (customPermissionsMatch) {
      try {
        // Parse the custom permissions array
        const customPermissions = eval(customPermissionsMatch[1]);
        apiMethods.push(...customPermissions);
      } catch (error) {
        console.warn(
          `Warning: Could not parse custom permissions in ${filePath}`
        );
      }
    }
  }

  // Look for class method definitions
  const methodRegex = /async\s+(\w+)\s*\(/g;
  let match;

  while ((match = methodRegex.exec(fileContent)) !== null) {
    const methodName = match[1];
    // Skip constructor and private methods
    if (
      methodName !== "constructor" &&
      !methodName.startsWith("_") &&
      !defaultApiMethods.includes(methodName)
    ) {
      apiMethods.push(methodName);
    }
  }

  return [
    {
      controller: `${directory}/${className}`,
      method: apiMethods,
    },
  ];
}

// Function to process all API TypeScript files
function processApiFiles() {
  // Search for all TypeScript files in the src/API directory
  glob("src/API/**/*.ts", (err, files) => {
    if (err) {
      console.error("Error reading API files:", err);
      return;
    }

    const allPermissions = [];

    // Process API endpoints
    files.forEach((filePath) => {
      // Skip index.ts and base API.ts files
      if (filePath.endsWith("index.ts") || filePath.endsWith("API.ts")) {
        return;
      }

      const apiPermissions = extractApiEndpoints(filePath);
      allPermissions.push(...apiPermissions);
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
    // If method is an array, spread it, otherwise add it as a single item
    if (Array.isArray(method)) {
      grouped[controller].push(...method);
    } else if (!grouped[controller].includes(method)) {
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
    const controllerName = parts[parts.length - 1]; // Get the last item

    if (!(name in formattedPermissions)) {
      formattedPermissions[name] = { name, controllers: {} };
    }

    if (!(controllerName in formattedPermissions[name].controllers)) {
      formattedPermissions[name].controllers[controllerName] = [];
    }

    // Merge actions, avoiding duplicates
    formattedPermissions[name].controllers[controllerName].push(
      ...groupedPermissions[controller].filter(
        (action) =>
          !formattedPermissions[name].controllers[controllerName].includes(
            action
          )
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
    const permissionResponse = await axios.post(`${baseURL}/permission`, {
      directives: permissions,
    });

    const notificationResponse = await axios.post(
      `http://82.29.175.67:6060/api/notification-setting`,
      {
        directives: permissions,
      }
    );

    console.log(
      "Permissions and notification settings successfully sent:",
      permissionResponse.data
    );
  } catch (error) {
    console.error(
      "Error sending permissions:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the script
processApiFiles();
