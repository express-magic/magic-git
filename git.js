'use strict';

var path = require('path')
  , exec = require('child_process').exec
  , log  = require('magic-log')
  , async    = require('async')
  , cwd  = process.cwd()
  , git  = {
      submodule: {}
    , host: {}
  }
  , subtree = {
    remote: {}
  }
;

git.host.add = function (args, cb) {
  git.args = args;

  async.waterfall([
      subtree.prepare
    , subtree.remote.add
    , subtree.remote.fetch
    , subtree.checkoutBranch
    , subtree.backToMaster
    , subtree.add
  ],
    subtree.added
  );
}

git.host.update = function (args, cb) {
  git.args = args;
  
  async.waterfall([
      subtree.prepare
    , subtree.checkoutBranch
    , subtree.pull
    , subtree.backToMaster
    , subtree.mergeMaster
    , 
  ]
  , subtree.updated
  );
}


git.host.remove = function (args, cb) {
  git.args = args;
  
  async.waterfall([
      subtree.prepare
    , subtree.rm
    , subtree.rmBranch
    , 
  ]
  , subtree.removed
  );
}


subtree.prepare = function (cb) {
  var host = git.args.hostname
    , prov = git.args.gitProvider
    , user = git.args.gitUser
    , repo = git.args.gitRepository
    , url  = git.args.gitUrl || prov + user + '/' + repo
  ;
  
  var err = null;
  if ( ! host || ! url ) {
    err = 'Host and/or url not defined';
  }
  
  cb(err, {host: host, url: url});
}

subtree.remote.add = function (args, cb) {
  var cmd  = 'git remote add ' + args.host + ' ' + args.url;
  xc(cmd, args, cb);
}

subtree.remote.fetch = function (args, cb) {
  var cmd  = 'git fetch ' + args.host;
  xc(cmd, args, cb);
}

subtree.checkoutBranch = function (args, cb) {
  var cmd  = 'git checkout -b ' + args.host + '/master';
  xc(cmd, args, cb);
}
subtree.backToMaster = function (args, cb) {
  var cmd  = 'git checkout master';
  xc(cmd, args, cb);
}


subtree.add = function (args, cb) {
  var cmd = 'git read-tree --prefix=hosts/' + args.host + ' -u ' + args.host;
  xc(cmd, args, cb);
}


subtree.pull = function (args, cb) {
  var cmd = 'git pull';
  xc(cmd, args, cb);
}

subtree.mergeMaster = function (args, cb) {
  var cmd = 'git merge --squash -s subtree --no-commit ' + args.host;
  xc(cmd, args, cb);
}

subtree.rm = function (args, cb) {
  var cmd = 'git rm hosts/' + args.host;
  xc(cmd, args, cb);
}

subtree.rmBranch = function (args, cb) {
  var cmd = 'git branch -D ' + args.host;
  xc(cmd, args, cb);
}

subtree.added = function (err, args) {
  if (err ) { return log(err, 'error'); }
  
  log('git subtree added');
}
subtree.updated = function (err, args) {
  if (err ) { return log(err, 'error'); }
  
  log('git subtree updated');
}

subtree.removed = function (err, args) {
  if (err ) { return log(err, 'error'); }
  
  log('git subtree removed');
}
function xc(cmd, args, cb) {
  log('exec: ' + cmd);
  exec( cmd, function (err, stdout, stderr) {
    if (stdout) {console.log(stdout);}
    if (stderr) {console.log(stderr);}
    cb(err, args);    
  });
}


module.exports = git.host;
