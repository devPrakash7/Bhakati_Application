const multer = require('multer');

const sanitizeAndRenameFilename = (filename) => {
  const extension = filename.split('.').pop();
  const nameWithoutExtension = filename.slice(0, -(extension.length + 1));
  const sanitizedFilename = nameWithoutExtension.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9]/g, '');
  const timestamp = Date.now();
  return `${sanitizedFilename}_${timestamp}.${extension}`;
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const sanitizedAndRenamedFilename = sanitizeAndRenameFilename(file.originalname);
    cb(null, sanitizedAndRenamedFilename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;

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