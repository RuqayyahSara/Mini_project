var express = require('express');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const mongoose = require("mongoose");
mongoose.Promise = Promise;
const toId = mongoose.Types.ObjectId

// Import files
var UserPhoto = require("../models/UserPhoto");
var auth = require("../middleware/auth");
var UserProfile = require('../models/UserProfile');
var router = express.Router();

//Implementing Profile for users
router.post('/', [auth,
	[check('bio', 'Enter Bio').not().isEmpty(),
	check('skills', 'Skills Fields are Required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { bio, location, skills, employees } = req.body;
		//Building Profile Object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (employees) {
			profileFields.employees = employees.split(',').map((skill) => skill.trim());
		}
		if (skills) {
			profileFields.skills = skills.split(',').map((skill) => skill.trim());
		}
		try {
			let profile = await UserProfile.findOne({ user: req.user.id });
			if (profile) {
				profile = await UserProfile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}
			//Create A Profile
			newprofile = new UserProfile(profileFields);
			await newprofile.save();
			return res.status(200).json(newprofile);
		} catch (err) {
			res.status(500).send('Server Error');
		}
	});

// Adding experience
router.put('/experience',[auth,
		[
			check('title', 'Enter Title').not().isEmpty(),
			check('company', 'Enter Company Name').not().isEmpty(),
			check('desc', 'Enter Work description').not().isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { title, company, desc } = req.body;
		const experience_fields = {};
		experience_fields.title = title;
		experience_fields.company = company;
		experience_fields.desc = desc;
		try {
			let profile = await UserProfile.findOne({ user: req.user.id });
			profile.experience.unshift(experience_fields);
			await profile.save();
			res.status(200).send(profile);
		} catch (err) {
			res.status(500).send("Server Error");
		}
	}
);

// DELETE - user-projects
router.delete("/delete/:exp_id", auth, async (req, res) => {
	try {
		const profile = await UserProfile.findOne({ user: req.user.id });
		const removeIndex = profile.ongoingProject.map((item) => {
			return (item._id)
		})
			.indexOf(req.params.exp_id);
		console.log(removeIndex, req.params.exp_id);
		profile.ongoingProject.splice(removeIndex, 1); //splicing the experience id
		await profile.save();
		res.send(profile);

	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// DELETE - user-projects
router.delete("/delete", auth, async (req, res) => {
	try {
		const profile = await UserPhoto.find().deleteMany({});
		await profile.save();
		res.send("successfully deleted");

	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// Adding Projects
router.put('/progress',[auth,
		[
			check('title', 'Enter title').not().isEmpty(),
			check('address', 'Enter address').not().isEmpty(),
			check('objectives', 'Enter objectives ').not().isEmpty(),
			check('summary', 'Enter Summary').not().isEmpty(),
			check('money', 'Enter money value').not().isEmpty(),
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { title, address, objectives, summary, money } = req.body;
		const progress_fields = {};

		progress_fields.title = title;
		progress_fields.address = address;
		progress_fields.objectives = objectives;
		progress_fields.summary = summary;
		progress_fields.money = money;
		try {
			let profile = await UserProfile.findOne({ user: req.user.id });
			profile.ongoingProject.unshift(progress_fields);
			await profile.save();
			res.status(200).json({ msg: "success", profile });

		} catch (err) {
			res.status(500).send("internal error");
		}});

// POST - Change pings Resolve to 'true'
router.post("/status/:exp_id", auth, async (req, res) => {
	try {
		const data = await UserProfile.findById(req.params.exp_id);
		if (data)
			data.cstatus = "completed";
		await data.save();
		return res.status(200).send(data);
	} catch (err) {
		res.status(500).send("Server Error");
	}
});

// router.post("/status/:exp_id", auth, async (req, res) => {
// 	try {
// 		const profile = await UserProfile.findOne({ user: req.user.id });
// 		const removeIndex = profile.ongoingProject.map((item) => {
// 			if (item._id == req.params.exp_id && item.cstatus === "Ongoing") {
// 				item.cstatus = "completed";
// 				return item;
// 			}
// 		});
// 		console.log("hiii")
// 		console.log(removeIndex)
// 		await profile.save();
// 		return res.send(profile);

// 	} catch (err) {
// 		res.status(500).send("Server Error");
// 	}
// });
// if (req.files === null)
// return res.status(400).json({msg:'no file uploaded'});

// const file = req.files.file;
// file.mv(`${__dirname}/client/public/uploads/${file.name}`, err=>{
// 	if(err)
// 	return res.status(500).send(err);

// 	res.status(200).json({fileName: file.name, filePath: `/uploads/${file.name}`});
// });

// creating storage for uploaded files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '../client/src/uploads');
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname)
	}
});
var upload = multer({
	storage: storage
});
// POST request to upload files
router.post('/add', upload.single("pictures"), auth,
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		try {
			const newUserPhoto = new UserPhoto({
				user: req.user.id,
				pictures: req.file.originalname,
				url: `../uploads/${req.file.originalname}`
			})
			console.log(req.file);
			await newUserPhoto.save();
			return res.status(200).json({ msg: "success", newUserPhoto });
		}
		catch (err) {
			return res.status(500).send("internal error");
		}});

//get images of a user

router.get("/photos", auth, async (req, res) => {
	const { user } = req.query;
	const manager = user ? req.user.role === "admin" ? toId(user) : res.status(403).json({ message: "Forbidden Request" }) : req.user.id;
	try {
		let photos = await UserPhoto.find({ user: manager }).populate('user', "name email -_id");
		if (photos) {
			return res.status(200).json(photos);
		}
		else {
			return res.status(400).json("Can't get pictures")
		}
	} catch (err) {
		return res.status(500).send("internal error");
	}
})

// GET manager Profile (restricted)
router.get("/details", auth, async (req, res) => {
	const { user } = req.query;
	const manager = user ? req.user.role === "admin" ? toId(user) : res.status(403).json({ message: "Forbidden Request" }) : req.user.id;
	try {
		let profile = await UserProfile.findOne({ user: manager }).populate('user', "name email avatar role -_id");
		if (profile) {
			return res.status(200).json(profile);
		}
		res.status(201).json({ msg: "No profile found for this user" });
	}
	catch (err) {
		res.status(400).send("Access denied!");
	}
})

module.exports = router;