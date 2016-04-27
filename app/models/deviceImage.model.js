var mongoose = require('mongoose');

// Image Data Schema
var ImageDataSchema = mongoose.Schema({
    url: {type: String, trim: true},
    thumb: {type: String, trim: true},
    bin: {type: String, trim: true},
    contentType: {type: String, trim: true}
});

// Exclude bin(ar), version and _id from result set being returned to the UI
ImageDataSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.imgId = ret._id;
        delete ret.__v;
        delete ret._id;
        delete ret.bin;
    }
});

var DeviceSchema = mongoose.Schema({
    email: {type: String,trim: true},
    name: {
        type: String,
        trim: true
    },
    kind: {
        type: String,
        enum: ['thumbnail', 'detail']
    },
    url: {type: String, trim: true},
    createdAt: {type: Date, required: true, default: Date.now()},
    imgs: [ImageDataSchema]
});

// Create schema index
DeviceSchema.index({createdAt: 1});

// Create TaskSchema model


// Middleware i.e. do some logic like fire an email or trigger some other event
DeviceSchema.pre('save', function (next) {
    console.log('Device saved...');
    next();
});

// Exclude bin(ar), version and _id from result set being returned to the UI
DeviceSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.taskId = ret._id;
        delete ret.data;
        delete ret.__v;
        delete ret._id;
    }
});
module.exports = mongoose.model("Device", DeviceSchema);