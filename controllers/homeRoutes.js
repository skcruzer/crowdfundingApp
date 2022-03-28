const router = require('express').Router()
const { Project, User } = require('../models');
const withAuth = require('../utils/auth')

router.get('/', async (req,res) => {
  try {
    // GET all projects and JOIN with user data
    const projectData = await Project.findAll({
      include: [
        {
          model: User,
          attributes: ['name']
        }
      ]
    })

    // serialize data
    const projects = projectData.map((project) => project.get({ plain: true }))
    
    // pass serialized data and session flag
    res.render('homepage', {
      projects,
      logged_in: req.session.logged_in
    })
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/project/:id', async (req, res) => {
  try {
    const projectData = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name']
        }
      ]
    })

    const project = projectData.get({ plain: true })

    res.render('project', {
      ...project,
      logged_in: req.session.logged_in
    })
  } catch (err) {
    res.status(500).json(err)
  }
})

// use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Project }]
    })

    const user = userData.get({ plain: true })

    res.render('profile', {
      ...user,
      logged_in: true
    })
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/login', (req, res) => {
  // if user already logged in, redirect request to a different route
  if (req.session.logged_in) {
    res.redirect('/profile')
    return
  }

  res.render('login')
})

module.exports = router