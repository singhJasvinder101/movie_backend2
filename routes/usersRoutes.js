const {
    registerUser, loginUser, adminDeleteUser, getAllUsers, getUserById, addToWatchList, getWatchLists, removeFromWatchList
} = require('../controllers/userController')
const { verifyIsLoggedIn, verifyIsAdmin } = require('../middlewares/VerifyAuthToken')

const router = require('express').Router()

router.post('/register', registerUser)
router.post('/login', loginUser)

router.use(verifyIsLoggedIn)

router.post('/watchlists', addToWatchList)
router.get('/watchlists', getWatchLists)
router.get('/watchlists/id/:id', removeFromWatchList)

router.use(verifyIsAdmin)

router.delete('/admin/deleteUser/:id', adminDeleteUser)
router.get('/admin/getallUsers', getAllUsers)
router.get('/admin/getUserById/:id', getUserById)

module.exports = router
