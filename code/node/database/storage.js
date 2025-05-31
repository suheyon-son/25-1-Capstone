const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');
const router = require('../route/routes');

const upload = multer({
  storage: nultergooigleStorage.storageEngine({
    bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: path.join(__dirname, '../secure', 'steel-fin-459711-k9-01424cceaf04.json'),
    filename: (req, file, cb) => {
      cb(null, `pothole/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
});

router.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('[POST] /api/upload file: ' + JSON.stringify(req.file));
    res.json({filename: req.file.filename});
});