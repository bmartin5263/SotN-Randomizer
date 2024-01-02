(function(self: any) {

  // let constants
  // if (self) {
  //   constants = self.sotnRando.constants
  // } else {
  let constants = require('./constants2')
  let RelicSymbol = constants.RelicSymbol;
  let x = new RelicSymbol('name')
  // }

  interface Relic {
    name: string,         // name of the relic
    ability: string       // 1-char symbol
  }

  const relics: Relic[] = [

  ]

  const exports = relics
  if (self) {
    self.sotnRando = Object.assign(self.sotnRando || {}, {
      relics: exports,
    })
  } else {
    module.exports = exports
  }

})(typeof(self) !== 'undefined' ? self : null)