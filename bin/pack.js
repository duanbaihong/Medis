const packager = require('electron-packager')
const path = require('path')
const pkg = require('../package')
const flat = require('electron-osx-sign').flat
const shell = require('child_process')
var iconName="medis128.ico"
if(process.platform==="darwin"){
  iconName="Medis.icns"
}
packager({
  dir: path.join(__dirname, '..'),
  appCopyright: '© 2018, Duanbaihong',
  asar: true,
  overwrite: true,
  darwinDarkModeSupport: true,
  electronVersion: pkg.electronVersion,
  icon: path.join(__dirname, '..', 'icns', `${iconName}`),
  out: path.join(__dirname, '..', 'out'),
  platform: process.platform,
  ignore: '(\.map|\.log|\.gitignore|LICENSE|README.md|\.DS_Store|bin|webpack.config.js|webpack.production.config.js|client/windows|client/redux|client/storage|out|\.git|\.vscode)',
  appBundleId: `li.zihua.${pkg.name}`,
  appCategoryType: 'public.app-category.developer-tools',
  osxSign: {
    type: process.env.NODE_ENV === 'production' ? 'distribution' : 'development',
    entitlements: path.join(__dirname, '..', 'parent.plist'),
    'entitlements-inherit': path.join(__dirname, '..', 'child.plist')
  }
}, function (err, res) {
  if (err) {
    throw err;
  }
  console.log(process.platform)
  switch(process.platform){
    case "darwin":
      const app = path.join(res[0], `${pkg.productName}.app`)
      console.log('flating...', app)
      flat({app}, function done (err) {
        if (err) {
          throw err
        }
        process.exit(0);
      })
      break;
    case "linux":
    case "aix":
    case "freebsd":
    case "openbsd":
    case "sunos":
      const application = path.join(res[0], `${pkg.productName}`)
      shell.exec("open"+ application);
      console.log("package complated! please to ["+application+"]")
      break;
    case "win32":

      break;
    default:
  }
})
