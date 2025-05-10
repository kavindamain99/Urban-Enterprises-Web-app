const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const GasModel = require("../models/GasModel");
const CustomerModel = require("../models/CustomerModel");
const UserModel = require("../models/UserModel");
const sendEmail = require("../utils/mailer");

const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear; y >= 2000; y--) {
  years.push(y);
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png", // images
      "mp4",
      "webm",
      "ogg", // recommended videos
      "mov",
      "avi",
      "mkv", // optional, less web-friendly
      "flv",
      "wmv",
      "3gp",
      "m4v", // legacy/optional formats
    ],
    resource_type: "auto", // IMPORTANT: allows both image and video
  },
});

const upload = multer({ storage: storage });

router.use(express.static("public"));

// GET Root Route - Admin login
router.get("/", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

// GET Login Error
router.get("/login_error", function (req, res) {
  res.sendFile(__dirname + "/loginerror.html");
});

// POST Admin login
router.post("/login", async function (req, res) {
  let id = req.body.userid;
  let pass = req.body.password;
  console.log(pass);

  let user = await UserModel.findOne({ userID: "admin" });
  console.log(user);
  if (pass == user.password) {
    req.session.isAdmin = true;
    console.log("Login Success");
    res.redirect("home");
  } else {
    res.redirect("login_error");
  }
});
function isAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  return res.redirect("/");
}
// GET - Home Page
router.get("/home", isAdmin, function (req, res) {
  res.sendFile(__dirname + "/admin_home.html");
});

//GET Admin Index
router.get("/admin_index", isAdmin, async function (req, res) {
  res.render("admin/admin_index");
});

// GET Gas Cars
router.get("/gas", isAdmin, async function (req, res) {
  let gas_models = await GasModel.find();
  res.render("admin/gas_list", { list: gas_models });
});

// POST Gas Car Form
router.post(
  "/addgas",
  isAdmin,
  upload.fields([
    { name: "imagePath", maxCount: 1 },
    { name: "galleryImages", maxCount: 4 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    const imageUrl = req.files["imagePath"]
      ? req.files["imagePath"][0].path
      : null;
    const galleryImagesUrls = req.files["galleryImages"]
      ? req.files["galleryImages"].map((file) => file.path)
      : [];
    const videoUrl = req.files["video"] ? req.files["video"][0].path : null;

    const newGas = new GasModel({
      imagePath: imageUrl,
      galleryImages: galleryImagesUrls,
      video: videoUrl,
      title: req.body.title,
      t2: req.body.t2,
      year: req.body.year,
      price: req.body.price,
      priceStr: req.body.priceStr,
      topspeed: req.body.topspeed,
      time60: req.body.time60,
      mileage: req.body.mileage,
      engine: req.body.engine,
      cyl: req.body.cyl,
      gearbox: req.body.gearbox,
      transmission: req.body.transmission,
      colour: req.body.colour,
      interior: req.body.interior,
      body: req.body.body,
      drivetrain: req.body.drivetrain,
      wheel: req.body.wheel,
      description: req.body.description,
      safety: req.body.safety,
      technology: req.body.technology,
    });

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 2000; y--) {
      years.push(y);
    }

    try {
      await newGas.save();
      res.redirect("/admin/gas");
    } catch (error) {
      console.error("Validation Error:", error);
      let fieldErrors = [];
      if (error.errors) {
        fieldErrors = Object.keys(error.errors).map(
          (key) => `${key} is required`
        );
      } else {
        fieldErrors = ["An unexpected error occurred"];
      }

      res.render("admin/gas_form", {
        errorMessageArray: fieldErrors,
        formData: req.body,
        years: years,
      });
    }
  }
);

// Delete Gas Car
router.get("/deletegas/:id", isAdmin, async function (req, res) {
  const result = await GasModel.findByIdAndRemove(req.params.id);
  console.log(result);

  res.redirect("/admin/gas");
});

// GET Customers
router.get("/customers", isAdmin, async function (req, res) {
  let customers = await CustomerModel.find();
  res.render("admin/customers_list", { list: customers });
});

// Delete User
router.get("/deletecustomer/:id", isAdmin, async function (req, res) {
  const result = await CustomerModel.findByIdAndRemove(req.params.id);
  console.log(result);

  res.redirect("/admin/customers");
});

// Image Handling

// Get Upload Image Form Page
router.get("/images", (req, res) => {
  res.render("admin/images_upload", { layout: false });
});

// POST Image File
router.post("/uploadimage", upload.single("imageupld"), (req, res) => {
  if (!req.file) {
    return res.send("No file uploaded.");
  }
  res.render("admin/images_upload", { img: req.file.path, layout: false }); // req.file.path is Cloudinary URL now
});

router.get("/addgas", isAdmin, (req, res) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2000; y--) {
    years.push(y);
  }
  res.render("admin/gas_form", {
    formData: {},
    years: years,
  });
});
router.get("/logout", function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
module.exports = router;
