const mongoose = require('mongoose');


const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role:{
        type: String,
        default :"visitor"
    }
})

const EmployeeModel = mongoose.model('users', EmployeeSchema);
module.exports = EmployeeModel;