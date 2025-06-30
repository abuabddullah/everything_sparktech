const axios = require('axios');

const getLocationNameSuggestions = async (input) => {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${process.env.GOOGLE_MAP_API_KEY}`);
  console.log('---------------- getLocationNameSuggestions --------------', response.data);
  return response.data;
}

const getLocationPoints = async (placeId) => {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_MAP_API_KEY}`);
  console.log('---------------- getLocationPoints --------------', response.data);
  return response.data;
}

const getDistanceBetweenTwoLocations = async (origin, destination) => {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.GOOGLE_MAP_API_KEY}`);

  console.log('---------------- getDistanceBetweenTwoLocations --------------', response.data);
  return response.data;
}

module.exports = { getLocationNameSuggestions, getLocationPoints, getDistanceBetweenTwoLocations }