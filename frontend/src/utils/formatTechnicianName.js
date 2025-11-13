/**
 * Formats technician name for display
 * Handles cases where name might be generic "technician" or missing
 * @param {Object} technician - Technician object with name, fullName, email properties
 * @returns {string} Formatted technician name
 */
export const formatTechnicianName = (technician) => {
  if (!technician) return 'Awaiting assignment';
  
  // Get the actual name - prefer fullName, then name, then email
  let displayName = technician.fullName || technician.name || technician.email || 'Awaiting assignment';
  
  // If name is generic "technician" or empty, use email or extract name from email
  if (!displayName || displayName.toLowerCase() === 'technician' || displayName === 'Awaiting assignment') {
    if (technician.email) {
      // Extract name from email (part before @) and capitalize
      const emailName = technician.email.split('@')[0];
      displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    } else {
      displayName = technician.fullName || 'Awaiting assignment';
    }
  }
  
  return displayName;
};

