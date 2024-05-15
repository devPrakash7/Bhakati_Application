
const multer = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
      /*let fileName = file.originalname;
      fileName = fileName.replace(/ /g,"_");
      fileName = fileName.replace("(","").replace(")","");
      fileName = Date.now() + '_'+ fileName;
      */

      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
      let fileName = file.fieldname + '-' + uniqueSuffix + ext;
      console.log('newFileName:', fileName);
      cb(null, fileName)
  }
});

const upload = multer({ storage: storage });
module.exports = upload

/*

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const profileUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'survey-overview',
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      let fileName = file.originalname;
      fileName = fileName.replace(/ /g,"_");
      fileName = fileName.replace("(","").replace(")","");

      req.file = Date.now() + fileName;
      let newFileName = "student-profile/"+ file.fieldname.toLocaleLowerCase()+"_"+Date.now()+"_" + fileName;
      console.log('newFileName:', newFileName);
     // console.log('file.fieldname:', file.fieldname);
      cb(null, newFileName);
    }
  })
});
*/