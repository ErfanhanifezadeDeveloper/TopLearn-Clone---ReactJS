const UserModel = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerValidation,loginValidation} = require('../validations/UserValidation');


async function registerUser(req , res)
{
    let errors = [];
    //Validation
    let {error} = registerValidation(req.body); 
    if(error)
    {
        let {details} = error;
        details.forEach(item => errors.push(item.message));
        return res.json({status: 406 , msg: errors});
    }

    const {fullname , email , password , password2} = req.body;

    //Checking if the user is already in the database
    let find = await UserModel.find({email});
    if(find.length > 0)
    {
        errors.push('this username/email has been used');
        return res.json({
            msg: errors,
            status: 401
        })
    }
    else{
        //Check password match
        if(password !== password2)
        {
            errors.push('Passwords do not match');
            return res.json({
                msg: errors,
                status: 406
            });
        }

        if(errors.length > 0) return null
        else{
            try{
                let hashPass = await bcrypt.hash(password , 10);
                const User = new UserModel({
                    fullname,
                    email,
                    password: hashPass
                });

                await User.save()
                .then(() => res.json({status: 201}))
                .catch(() => res.json({status: 503}));
            }
            catch(err){res.json({msg: err , status: 500})};
        }
    }
}

async function loginUser(req , res)
{
    let errors = [];
    //Validation
    let {error} = loginValidation(req.body);
    if(error)
    {
        let {details} = error;
        details.forEach(item => errors.push(item.message));
        return res.json({status: 406 , msg: errors});
    }

    let {email , password} = req.body;
    //Checking User with email
    let findByEmail = await UserModel.findOne({email});
    if(findByEmail)
    {
        //Compare
        let ComparingPass = await bcrypt.compare(password , findByEmail.password);
        if(!ComparingPass)
        {
            errors.push('Passwords do not match');
            return res.json({
                msg: errors,
                status: 406
            });
        }
        
        const today = new Date()
        const tomorrow = new Date(today)
        let exp = tomorrow.setDate(tomorrow.getDate() + 1);

        let token = await jwt.sign(
            {data: findByEmail , exp} ,
            process.env.ACCESS_TOKEN_SECRET
        );
        return res.json({
            token,
            status: 200
        });
    }
    else{
        errors.push('This user not fund please sign up');
        res.json({
            msg: errors,
            status: 404
        });
    }
}

async function logoutUser(req , res)
{
    try{
        let {token} = req.body;

        //Check
        if(!token)
        {
            return res.json({
                msg: 'Please complete the required item',
                status: 406
            })
        }

        let decode = await jwt.decode(token , {complete: true});
        //Token validation 
        if(decode === null)
        {
            return res.json({
                msg: 'Invalid token!',
                status: 406
            });
        }
        res.json({
            status: 200,
            msg: `goodbye ${decode.payload.data.fullname}`
        });
    }
    catch(err){
        res.json({msg: err , status: 500});
    }
}

async function changePass(req , res)
{   
    let {pass , id} = req.query;
    if(!id && !pass){
        return res.json({
            msg: 'Complete required items',
            status: 406
        });
    }else{
        if(!id) return res.json({status: 404 , msg: 'not fund'});
        try{
            let hashPass = await bcrypt.hash(pass , 10);
            let findAndUpdate = await UserModel.updateOne(
                {_id: id},
                {
                    $set: {
                        password: hashPass
                    }
                }
            );

            res.json({
                msg: findAndUpdate,
                status: 200
            })
        }catch(err){res.json({msg: err , status: 500})}
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    changePass
}