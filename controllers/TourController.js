const { Tour_Package } = require('../models');
const ApiError = require('../utils/ApiError');
const { Op } = require("sequelize");

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// const imagekit = require('../images/imagekit'); belum dibikin imagekit nya hehe
const findTourPackageById = async (req, res, next) => {
    try {
        const tourPackage = await Tour_Package.findOne({
          where: {
            id: req.params.id,
          },
        });
    
        if (!tourPackage) {
          return next(
            new ApiError(`tourPackage with this ${req.params.id} is not exist`, 404)
          );
        }
        res.status(200).json({
          status: "Success",
          data: {
            tourPackage,
          },
        });
      } catch (err) {
        console.log(err);
        next(new ApiError(err.message, 400));
      }
};
const findTourPackages = async (req, res, next) => {
  try {
    const { tourName, username, shop, page, limit } = req.query;

    const condition = {};
    if (tourName) condition.name = { [Op.iLike]: `%${tourName}%` };

    const includeTourCondition = {};
    if (shop) includeTourCondition.name = { [Op.iLike]: `%${shop}%` };

    const includeUserCondition = {};
    if (username) includeUserCondition.name = { [Op.iLike]: `%${username}%` };

    const pageNum = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const offset = (pageNum - 1) * pageSize;

    let whereCondition = condition;

    const totalCount = await Tour_Package.count({ where: whereCondition });

    const tourPackages = await Tour_Package.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      attributes: ['id', 'description', 'image', 'price', 'destination', 'duration', 'storeId'],
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({
      status: "Success",
      data: {
        tourPackages,
        pagination: {
          totalData: totalCount,
          totalPages,
          pageNum,
          pageSize,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(error.message, 400));
  }
};
const createTourPackage = async (req, res, next) => {
    const { packageName, image, price, description, destination, duration, storeId } = req.body;

    try {
        const newTourPackage = await Tour_Package.create({
            packageName,
            image,
            price,
            description,
            destination,
            duration,
            storeId
        })
        res.status(200).json({
            status: "Success",
            data: {
                newTourPackage
            },
          });
    } catch (error) {
        console.log(error);
        next(new ApiError(error.message, 400));
    }
}

const updateTourPackage = async(req, res, next) => {
  const { packageName, image, price, description, destination, duration, storeId } = req.body;
  const tourId = req.params.id;
  try {
    if(!tourId){
      next(new ApiError("Please provide a tour ID", 404));
    }
    await Tour_Package.update(
      {
        packageName,
        image,
        price,
        description,
        destination,
        duration,
        storeId
      },
      {
      where:{
        id: tourId
      }
    });
  
    res.status(200).json({
        status: "Success",
       message: "successfully update TOur Package"
      });
} catch (error) {
    console.log(error);
    next(new ApiError(error.message, 400));
}
}

const deleteTourPackage = async(req, res, next) => {
  const id = req.params.id;

  try {
    const deletedRows = await Tour_Package.destroy({
      where: {
        id,
      }
    })
    if (deletedRows === 0) {
      return res.status(404).json({
        status: "Error",
        message: "Tour package not found",
      });
    }
    res.status(200).json({
      status: "Success",
      message: "Success delete product",
    });
  } catch (error) {
    console.log(error);
    next(new ApiError(error.message, 400));
  }
}

module.exports = {createTourPackage, findTourPackageById, findTourPackages, updateTourPackage, deleteTourPackage}




// code for image upload
// app.post('/upload', upload.fields([{ name: 'poto' }, { name: 'data' }]), (req, res) => {
//     try {
//       // Access JSON data
//       const jsonData = req.body;
  
//       // Access uploaded files
//       const poto = req.files['poto'][0];
//       const data = req.body['data'];
  
//       // Prepare response data
//       const responseData = {
//         poto: poto ? {
//           filename: poto.originalname,
//           path: poto.path
//         } : null,
//         data: data,
//         jsonData: jsonData
//       };
  
//       // Send back the response
//       res.json(responseData);
//     } catch (error) {
//       res.status(400).json({
//         status: "error",
//         message: error.message
//       });
//       console.log(error);
//     }
//   });
  