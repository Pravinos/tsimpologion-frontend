import { useState, useEffect } from 'react';

interface BusinessHoursFormat {
  day: string;
  hours: string;
}

interface IsOpenResult {
  isOpen: boolean;
  formattedHours: BusinessHoursFormat[];
}

const useBusinessHours = (businessHours: any): IsOpenResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [formattedHours, setFormattedHours] = useState<BusinessHoursFormat[]>([]);
  
  useEffect(() => {
    if (!businessHours) {
      setIsOpen(false);
      setFormattedHours([]);
      return;
    }
    
    let hours = businessHours;
    if (typeof hours === 'string') {
      try { 
        hours = JSON.parse(hours); 
      } catch (e) {
        console.error('Failed to parse business hours:', e);
        setIsOpen(false);
        setFormattedHours([]);
        return;
      }
    }
    
    if (typeof hours === 'object' && hours !== null) {
      const dayMap: Record<string, string> = {
        'mon': 'Monday', 
        'tue': 'Tuesday', 
        'wed': 'Wednesday', 
        'thu': 'Thursday', 
        'fri': 'Friday', 
        'sat': 'Saturday', 
        'sun': 'Sunday'
      };
      
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayHours: Record<string, string> = {};
      
      // Process all entries from the hours object
      Object.entries(hours).forEach(([key, value]) => {
        if (key.includes('-')) {
          // Handle ranges like 'mon-fri'
          const [start, end] = key.split('-');
          const startIdx = dayOrder.indexOf(dayMap[start.slice(0, 3).toLowerCase()] || start);
          const endIdx = dayOrder.indexOf(dayMap[end.slice(0, 3).toLowerCase()] || end);
          
          if (startIdx >= 0 && endIdx >= 0) {
            for (let i = startIdx; i <= endIdx; i++) {
              dayHours[dayOrder[i]] = value as string;
            }
          }
        } else {
          // Handle single days
          const d = dayMap[key.slice(0, 3).toLowerCase()] || key;
          dayHours[d] = value as string;
        }
      });
      
      // Format for component consumption
      const formatted = dayOrder.map(day => ({ 
        day, 
        hours: dayHours[day] || 'Closed' 
      }));
      
      setFormattedHours(formatted);
      
      // Check if currently open
      const todayIdx = new Date().getDay();
      const todayKey = dayOrder[(todayIdx + 6) % 7]; // Adjust for Sunday being 0 in JS but 6 in our array
      const todayRange = dayHours[todayKey];
      
      if (todayRange && todayRange !== 'Closed') {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const [from, to] = todayRange.split('-');
        const [fromH, fromM] = from.split(':').map(Number);
        const [toH, toM] = to.split(':').map(Number);
        const nowMins = hour * 60 + minute;
        const fromMins = fromH * 60 + fromM;
        let toMins = toH * 60 + toM;
        
        // Handle cases where closing time is after midnight
        if (toMins <= fromMins) toMins += 24 * 60;
        
        // Check if current time is within business hours
        setIsOpen(
          (nowMins >= fromMins && nowMins < toMins) || 
          (toMins > 24 * 60 && nowMins < (toMins - 24 * 60))
        );
      } else {
        setIsOpen(false);
      }
    }
  }, [businessHours]);
  
  return { isOpen, formattedHours };
};

export default useBusinessHours;
