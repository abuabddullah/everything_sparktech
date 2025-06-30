const { getSpecificDetails } = require('../User/user.service');
const Load = require('./load.model');

const addManyLoadDetails = async (LoadDetails) => {
  return await Load.insertMany(LoadDetails);
}

const getLoadById = async (id) => {
  return await Load.findById(id);
}


const getLoad = async (filter, find = null, populateOptions = null) => {
  let query = Load.findOne(filter);
  if (find) query = query.select(find);
  if (populateOptions) query = query.populate('user', populateOptions);
  const result = await query;
  return { query: result };
};



module.exports = {
  getLoad,
  getLoadById,
  addManyLoadDetails
}
