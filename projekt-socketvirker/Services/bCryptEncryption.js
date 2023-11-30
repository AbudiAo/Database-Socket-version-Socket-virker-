const bcrypt = require('bcrypt')

async function encryptPassword(password) {
    const saltRounds = 5;
    try{
        const encryptedPassword = await bcrypt.hash(password, saltRounds) 
        // .hash() metoden benyttes til at hashe passwordet, som sendes til denne funktion som argument
        // det første argument i hash() er hvad vi hasher og salt rounds referrer til hvor meget det skal hashes/krypteres
        return encryptedPassword // returnerer det krypterede password
    } catch(error) {
        console.log(error);
    };
};

/* async function encryptUserID(userID) {
    const saltRounds = 10;
    let IDstring = userID.toString(); // konverterer userID til en string, da bcrypt.hash() kun kan kryptere strings
    try{
        const encryptedUserID = await bcrypt.hash(IDstring, saltRounds) 
        return encryptedUserID 
    } catch(error) {
        console.log(error);
    };
}; */ // Kun hvis userID skal krypteres

module.exports = { encryptPassword };
