var User = Reap.Models.User;

var index = function(req, res) {
  User.findAll({}).success(function(users) {
    res.status(200).send(users);
  })
}

module.exports = {
  index: index
}