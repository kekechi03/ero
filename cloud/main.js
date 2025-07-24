// Parse Cloud Code for ERO app
// This file should be deployed to Back4App Cloud Code

Parse.Cloud.define('getUserCount', async (request) => {
  const query = new Parse.Query(Parse.User);
  const count = await query.count({ useMasterKey: true });
  return { count: count };
});

// Additional cloud functions can be added here
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
