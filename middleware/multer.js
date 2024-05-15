const multer = require('multer');

const sanitizeAndRenameFilename = (filename) => {
  const extension = filename.split('.').pop();
  const nameWithoutExtension = filename.slice(0, -(extension.length + 1));

  const sanitizedFilename = nameWithoutExtension.replace(/\s+/g, '_')
                                                .replace(/[^a-zA-Z0-9]/g, '')
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
