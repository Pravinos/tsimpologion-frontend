// Export remaining Profile components (ProfileInfo/ProfileHeader/ProfileActions/
// AvatarSection/PersonalInfoSection were removed as confirmed dead code — see
// the Auth to Actions bug-fix plan, section 8)
export { default as FormInput } from './FormInput';
export { default as PasswordSection } from './PasswordSection';

// Create a React component as the default export
import React from 'react';
const ProfileExports = () => null;
export default ProfileExports;
