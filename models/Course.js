const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

// Static method to get average of course tuition
//? This adds a static method to the constructor of this model (Course model) which can be called directly on the model
CourseSchema.statics.getAverageCost = async function (bootcampId) {

  console.log('Calculating average cost..'.blue);

  //? 'this' here is the Course model
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId } //? Matches the course to its bootcamp 
    },
    {
      $group: {
        //? The obj returned will have these fields
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' } //? '$avg' operator averages the tuitions of all courses that belong to that specific bootcamp. 
      }
    }
  ]);

  try {
    //? Adding the averageCost to the Bootcamp of the course 
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      //? Math.ceil gives a whole number intead of decimal
    })
  } catch (err) {
    console.error(err);
  }

}

// Call getAverageCost after saving
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});


// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);