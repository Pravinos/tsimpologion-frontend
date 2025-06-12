export const parseSocialLinks = (socialLinks: any): Record<string, string> => {
  if (!socialLinks) {
    return {};
  }
  
  let links = socialLinks;
  if (typeof links === 'string') {
    try { 
      links = JSON.parse(links); 
    } catch (e) {
      console.error('Failed to parse social links:', e);
      return {};
    }
  }
  
  if (typeof links === 'object' && links !== null) {
    return links;
  }
  
  return {};
};
