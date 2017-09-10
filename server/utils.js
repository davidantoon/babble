'use strict';

module.exports = {

    checkInt(data, res, name) {
        let value = parseInt(data[name]);

        if (isNaN(value)) {
            res.status(400).send({error: "Invalid parameter, " + name + " should be an Int"});
            throw Error("Invalid parameter, " + name + " should be an Int");
        }
        return value;
    },

    checkString(data, res, name) {
        let value = data[name];
        if (value === null || value === undefined) {
            res.status(400).send({error: "Invalid parameter, " + name + " should be a String"});
            throw Error("Invalid parameter, " + name + " should be a String");
        }
        return value + "";
    }
};