import CryptoJS from "crypto-js";

// Generate a hash for a route using SHA-256
const generatePermissionHash = (permission: string): string => {
  const hash = CryptoJS.SHA256(permission).toString(CryptoJS.enc.Hex); // Convert to hex string
  const shortHash = hash.substring(0, 16);
  const uuid = `${shortHash.substring(0, 4)}-${shortHash.substring(4, 8)}-${shortHash.substring(8, 12)}-${shortHash.substring(12, 16)}`;
  return uuid;
};

export { generatePermissionHash };
