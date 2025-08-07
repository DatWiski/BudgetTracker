/**
 * Maps category names to appropriate icon names
 */
export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  // Direct matches
  if (name.includes('entertainment')) return 'entertainment';
  if (name.includes('productivity')) return 'productivity';
  if (name.includes('utilities')) return 'utilities';
  if (name.includes('education')) return 'education';
  if (name.includes('fitness') || name.includes('gym') || name.includes('workout')) return 'fitness';
  if (name.includes('health') || name.includes('medical')) return 'health';
  if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) return 'food';
  if (name.includes('transport') || name.includes('car') || name.includes('uber') || name.includes('gas')) return 'transport';
  if (name.includes('shopping') || name.includes('store') || name.includes('retail')) return 'shopping';
  
  // Subscription-specific matches
  if (name.includes('subscription') || name.includes('streaming') || name.includes('netflix') || 
      name.includes('spotify') || name.includes('disney') || name.includes('hulu')) return 'entertainment';
  if (name.includes('software') || name.includes('adobe') || name.includes('office') || 
      name.includes('microsoft') || name.includes('google')) return 'productivity';
  if (name.includes('cloud') || name.includes('storage') || name.includes('hosting') || 
      name.includes('aws') || name.includes('dropbox')) return 'utilities';
  
  // Default fallback
  return 'subscriptions';
};