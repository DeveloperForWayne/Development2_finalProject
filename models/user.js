const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});


// confirmPassword - is not stored in the database so we define this as a virtual attribute
userSchema.virtual('confirmPassword')
.get(function() {
    return this._confirmPassword;
})
.set(function(value) {
    this._confirmPassword = value;
})

userSchema.pre('validate', function(next) {
    if (this.password !== this.confirmPassword) {
        this.invalidate('passwordConfirmation', 'your password & password confirmation dont match')
    }
    next()
})

// applies mongoose0unique-validator to ensure email is unique
userSchema.plugin(uniqueValidator)

userSchema.pre('validate', function (next) {
	if (this.password.length <= 8) {
		this.invalidate('password', 'password needs to be a minimum of 9 characters')
	}
	next()
})



userSchema.pre('save', function (next) {
	var user = this;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) return next(err);

		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) return next(err);

			user.password = hash;
			next();
		});
	});
});

//authenticate input against database
userSchema.statics.authenticate = function (email, password, callback) {
	userModel.findOne({
			email: email
		})
		.exec(function (err, user) {
			if (err) {
				return callback(err)
			} else if (!user) {
				var err = new Error('User not found.');
				err.status = 401;
				return callback(err);
			}
			bcrypt.compare(password, user.password, function (err, result) {
				if (result === true) {
					return callback(null, user);
				} else {
					return callback();
				}
			})
		});
}

let userModel = mongoose.model('User', userSchema);

module.exports = userModel;
