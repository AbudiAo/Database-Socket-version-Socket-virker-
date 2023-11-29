const bcrypt = require('bcrypt')
const saltRounds = 5;

async function encryptPassword(password) {
    try{
        const encryptedPassword = await bcrypt.hash(password, saltRounds) 
        // .hash() metoden benyttes til at hashe passwordet, som sendes til denne funktion som argument
        // det første argument i hash() er hvad vi hasher og salt rounds referrer til hvor meget det skal hashes/krypteres
        return encryptedPassword // returnerer det krypterede password
    } catch(error) {
        console.log(error);
    };
};

module.exports = { encryptPassword };