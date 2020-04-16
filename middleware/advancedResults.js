//? Below is the shortway of nesting function within a function
const advancedResults = (model, populate) => async (req, res, next) => {

  let query;

  // Copy req.query
  const reqQuery = { ...req.query };
  console.log("1");

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over remove fields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`); //?Adding a dollar sign to the specific characters in query to match the query style for mongoDB (gt - greater than)

  // Finding resource
  query = model.find(JSON.parse(queryStr));
  console.log("2");

  if (populate) {
    query = query.populate(populate);
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort 
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt') //? If no sorting parameter is specified sort by created date by default.
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1; //? Default is page 1 unless specified, page 
  const limit = parseInt(req.query.limit, 10) || 25; //? Limit per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const results = await query;
  console.log(results);

  // Pagination result 
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit //? same as "limit:limit"
    }
  }


  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }
  console.log("3");

  next(); //? Has to be called since this is a middleware file

};

module.exports = advancedResults;

