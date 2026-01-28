// checkPermissions.js (ES Modules)
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

// Function to generate the hashed UUID from permission
const generatePermissionHash = (permission) => {
  const hash = createHash('sha256').update(permission).digest('hex');
  const shortHash = hash.substring(0, 12);
  const uuid = `${shortHash.substring(0, 4)}-${shortHash.substring(4, 8)}-${shortHash.substring(8, 12)}-${shortHash.substring(12, 16)}-${shortHash.substring(16, 28)}`;
  return uuid;
};

// Middleware to decode JWT and check if route matches the controller-method
const checkPermissions = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  //if (!token) {
  //  return res.status(403).json({ error: 'Forbidden' });
  //}

  try {
    const decoded = {
	  "sub": "1234567890",
	  "name": "John Doe",
	  "iat": 1516239022,
	  "permission": ["f571-2161-0cf3-8b21"]
	};
    //const decoded = jwt.decode(token);

    if (!decoded || !decoded.permission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const permissions = decoded.permission;
    const formattedRoute = getFormattedControllerMethod(req);

    const hashedPermission = generatePermissionHash(formattedRoute);

      return res.status(200).json({ success: permissions, hash: formattedRoute});
    if (!permissions.includes(hashedPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();

  } catch (error) {
    console.error('Error decoding JWT:', error);
    return res.status(403).json({ error: 'Forbidden' });
  }
};

// Function to extract and format the controller-method string
const getFormattedControllerMethod = (req) => {
  const controllerMethod = req.route.stack[0].name;
  const formattedRoute = controllerMethod.replace('@', '\\');
  return formattedRoute;
};

export default checkPermissions;
