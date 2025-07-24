# Cloud Code Deployment Guide

## Back4App Cloud Code Setup

To deploy these cloud functions to your Back4App Parse Server:

### Method 1: Back4App Dashboard
1. Log into your Back4App dashboard
2. Navigate to your app
3. Go to Cloud Code section
4. Upload the `main.js` file
5. Deploy the changes

### Method 2: Back4App CLI
```bash
# Install Back4App CLI
npm install -g back4app

# Login to your account
back4app login

# Deploy cloud code
back4app deploy cloud/main.js
```

### Cloud Functions Available
// Cloud Code for Back4App Parse Server
// Deploy this code via Back4App Dashboard > Cloud Code

Parse.Cloud.define('getUserCount', async (request) => {
  const query = new Parse.Query(Parse.User);
  const count = await query.count({ useMasterKey: true });
  return { count: count };
});

// Optional additional statistics
Parse.Cloud.define('getTotalAppraisals', async (request) => {
  const query = new Parse.Query('Appraisal');
  const count = await query.count({ useMasterKey: true });
  return { count: count };
});

Parse.Cloud.define('getTotalImages', async (request) => {
  const query = new Parse.Query('Image');
  const count = await query.count({ useMasterKey: true });
  return { count: count };
});

## Client-Side Usage

The frontend already includes the integration in `AuthView.tsx`:
```typescript
const fetchUserCount = async () => {
  try {
    const response = await Parse.Cloud.run('getUserCount');
    setUserCount(response.count);
  } catch (error) {
    console.error('Error fetching user count:', error);
    setUserCount(0);
  }
};
```

## Security Notes
- All functions use `useMasterKey: true` for accurate counts
- No sensitive user data is exposed
- Counts are read-only operations
