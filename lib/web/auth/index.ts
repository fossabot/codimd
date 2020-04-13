import { Request, Response, Router } from 'express'
import passport from 'passport'
import { config } from '../../config'
import { logger } from '../../logger'
import { User } from '../../models'
import facebook from './facebook'
import twitter from './twitter'
import github from './github'
import gitlab from './gitlab'
import dropbox from './dropbox'
import google from './google'
import ldap from './ldap'
import saml from './saml'
import oauth2 from './oauth2'
import email from './email'
import openid from './openid'

const AuthRouter = Router()

// serialize and deserialize
passport.serializeUser(function (user: User, done) {
  logger.info('serializeUser: ' + user.id)
  return done(null, user.id)
})

passport.deserializeUser(function (id: string, done) {
  User.findOne({
    where: {
      id: id
    }
  }).then(function (user) {
    // Don't die on non-existent user
    if (user == null) {
      // The extra object with message doesn't exits in @types/passport
      return done(null, false) // , { message: 'Invalid UserID' })
    }

    logger.info('deserializeUser: ' + user.id)
    return done(null, user)
  }).catch(function (err) {
    logger.error(err)
    return done(err, null)
  })
})

if (config.isFacebookEnable) AuthRouter.use(facebook)
if (config.isTwitterEnable) AuthRouter.use(twitter)
if (config.isGitHubEnable) AuthRouter.use(github)
if (config.isGitLabEnable) AuthRouter.use(gitlab)
if (config.isDropboxEnable) AuthRouter.use(dropbox)
if (config.isGoogleEnable) AuthRouter.use(google)
if (config.isLDAPEnable) AuthRouter.use(ldap)
if (config.isSAMLEnable) AuthRouter.use(saml)
if (config.isOAuth2Enable) AuthRouter.use(oauth2)
if (config.isEmailEnable) AuthRouter.use(email)
if (config.isOpenIDEnable) AuthRouter.use(openid)

// logout
AuthRouter.get('/logout', function (req: Request, res: Response) {
  if (config.debug && req.isAuthenticated()) {
    logger.debug('user logout: ' + req.user?.id)
  }
  req.logout()
  res.redirect(config.serverURL + '/')
})

export { AuthRouter }