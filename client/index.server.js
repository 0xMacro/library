//
// This does nothing in production.
// However, it's mad convenient for dev and Pull Request apps.
//
export default ({ halt }) => {
  const req = halt()
  req.redirect('/library')
}