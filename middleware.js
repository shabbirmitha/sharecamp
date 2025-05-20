const { campgroundSchema, reviewSchema, userSchema } = require('./joiSchemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const User = require('./models/user');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req user', req.user); //always constains whether user is present or not
    // console.log(req.path, req.originalUrl); //gives the last path you visited
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!!')
        return res.redirect('/login')
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        // Since details is array of object
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthors = async (req, res, next) => {
    const { id } = req.params
    // Protecting this root only the owner can edit
    const campground = await Campground.findById(id)
    if (req.user && !campground.author.equals(req.user._id)) {
        req.flash('error', `You don't have authorization to edit ${campground.title}`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


module.exports.isReviewAuthors = async (req, res, next) => {
    const { id, reviewId } = req.params
    // Protecting this root only the owner can edit
    const review = await Review.findById(reviewId)
    if (req.user && !review.author.equals(req.user._id)) {
        req.flash('error', `You don't have authorization to delete review`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.checkUserOwnership = function (req, res, next) {
    //if user is logged in
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, foundUser) {
            if (err || !foundUser) {
                req.flash('error', 'Something Went Wrong! in checking');
                res.redirect('back');
            } else {
                 //if user is logged in, do they own the profile?
                if (foundUser.equals(req.user._id)) {
                    next();
                } else {
                    //otherwise redirect
                    req.flash('error', "You don't have permission to do that.");
                    res.redirect('back');
                };
            };
        });
    } else {
        //if not, redirect.
        req.flash('error', "You need to be logged in to do that.");
        res.redirect('back');
    };
 
};