function checkRole(role) {
  
    return function(req, res, next) {
      let test = req.userRole
      if (req.userRole === role) {
        next(); 
      } else {
        res.json({test, role});
      }
    };
  }

  module.exports = checkRole;