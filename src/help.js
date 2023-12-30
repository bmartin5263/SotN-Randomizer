(function(self) {
  const path = require('path')

  let presets;
  let constants;
  let relics;
  let extension;

  if (self) {
    presets = self.sotnRando.presets;
    constants = self.sotnRando.constants;
    relics = self.sotnRando.relics;
    extension = self.sotnRando.extension;
  } else {
    presets = require("../presets");
    constants = require("./constants");
    relics = require("./relics");
    extension = require("./extension");
  }

  const optionsHelp = [
    'The options string may contain any of the following:',
    '  "p" for preset (`--help preset`)',
    '  "d" for enemy drops (`--help drops`)',
    '  "e" for starting equipment (`--help equipment`)',
    '  "i" for item locations (`--help items`)',
    '  "b" for prologue rewards (`--help rewards`)',
    '  "r" for relic locations (`--help relics`)',
    '  "s" for stats',
    '  "m" for music',
    '  "w" for writes (`--help writes`)',
    '  "k" for turkey mode',
    '  "t" for tournament mode (`--help tournament`)',
    '',
    'The default randomization mode is "'
    +  constants.defaultOptions
    + '", which randomizes everything.',
    '',
    'Examples:',
    '  $0 --opt d   # Only randomize enemy drops.',
    '  $0 --opt di  # Randomize drops and item locations.',
    '  $0           # Randomize everything (default mode).',
  ].join('\n')

  const dropsHelp = [
    'Enemy drop randomization can be toggled with the "d" switch. Drops may',
    'also be specified using argument syntax.',
    '',
    'Drops format:',
    '  d[:<enemy>[-<level>][:[<item>][-[<item>]]][:...]',
    '',
    'Enemies and items are specified by removing any non-alphanumeric',
    'characters from their name. Enemies with the same name can be dis-',
    'ambiguated by specifying their level.',
    '',
    'A wildcard character ("*") can be used to replace items for all enemies.',
    '',
    'The global drop table can be edited by specifying "Global" as the enemy',
    'name. Please note that there are 32 items in the global drop table.',
    '',
    'Examples:',
    '  d:Zombie:Cutlass-Bandanna   Zombie drops Cutlass and Bandanna',
    '  d:Slinger:-Orange           Replace Slinger rare drop with orange',
    '  d:MedusaHead-8:             Medusa Head level 8 drops nothing',
    '  d:*:Grapes-Potion           Every enemy drops Grapes and Potion',
    '  d:Global:Apple-Orange-Tart  Replace first 3 items in global drops table',
    '                              with Apple, Orange, and Tart',
    '',
    'Items can be prevented from being randomized to enemy\'s drop table by',
    'prefixing the enemy\'s name with a hyphen ("-"):',
    '  d:-AxeKnight:Stopwatch   Axe Knight never drops Stopwatch',
    '  d:-StoneRose:Medal-Opal  Stone Rose never drops Medal or Opal',
    '',
    'If other randomization options follow a drop, they must also be',
    'separated from the drop with a comma:',
    '  $0 --opt d:Slinger:-Orange,ipt',
  ].join('\n')

  const equipmentHelp = [
    'Starting equipment randomization can be toggled with the "e" switch.',
    'Equipment may also be specified using argument syntax.',
    '',
    'Equipment format:',
    '  e[:<slot>[:<item>]][:...]',
    '',
    'Items are specified by removing any non-alphanumeric characters from',
    'their name.',
    '',
    'Slot is one of:',
    '  "r" for right hand',
    '  "l" for left hand',
    '  "h" for head',
    '  "b" for body',
    '  "c" for cloak',
    '  "o" for other',
    '  "a" for Axe Lord armor (Axe Armor mode only)',
    '  "x" for Lapis lazuli (Luck mode only)',
    '',
    'Examples:',
    '  e:l:Marsil:Fireshield  Marsil in left hand, Fire shield in right',
    '  e:o:Duplicator         Duplicator in other slot',
    '  e:c:                   No cloak',
    '',
    'Equipment can be prevented from being starting equipment by prefixing',
    'an equipment slot with a hyphen ("-"):',
    '  e:-r:Crissaegrim            Never start with Crissaegrim',
    '  e:-l:IronShield:DarkShield  Never start with Iron shield or Dark shield',
    '',
    'If other randomization options follow an equip, they must also be',
    'separated from the equip with a comma:',
    '  $0 --opt e:o:Duplicator,dpt',
  ].join('\n')

  const itemsHelp = [
    'Item location randomization can be toggled using the "i" switch. Items',
    'may be placed in specific locations using argument syntax.',
    '',
    'Items format:',
    '  i[:<zone>:<item>[-<index>]:<replacement>][:...]',
    '',
    'Items are specified by removing any non-alphanumeric characters from',
    'their name. If a zone contains multiple occurences of the same item,',
    'it can be disambuated by specifying its index.',
    '',
    'A wildcard character ("*") can be used for the zone and/or the item. When',
    'used as the zone, the replacement will occur in every zone. When used as',
    'the item, every item will be replaced.',
    '',
    'Zone is one of:',
    '  ST0   (Final Stage: Bloodlines)',
    '  ARE   (Colosseum)',
    '  CAT   (Catacombs)',
    '  CHI   (Abandoned Mine)',
    '  DAI   (Royal Chapel)',
    '  LIB   (Long Library)',
    '  NO0   (Marble Gallery)',
    '  NO1   (Outer Wall)',
    '  NO2   (Olrox\'s Quarters)',
    '  NO3   (Castle Entrance)',
    '  NO4   (Underground Caverns)',
    '  NZ0   (Alchemy Laboratory)',
    '  NZ1   (Clock Tower)',
    '  TOP   (Castle Keep)',
    '  RARE  (Reverse Colosseum)',
    '  RCAT  (Floating Catacombs)',
    '  RCHI  (Cave)',
    '  RDAI  (Anti-Chapel)',
    '  RLIB  (Forbidden Library)',
    '  RNO0  (Black Marble Gallery)',
    '  RNO1  (Reverse Outer Wall)',
    '  RNO2  (Death Wing\'s Lair)',
    '  RNO3  (Reverse Entrance)',
    '  RNO4  (Reverse Caverns)',
    '  RNZ0  (Necromancy Laboratory)',
    '  RNZ1  (Reverse Clock Tower)',
    '  RTOP  (Reverse Castle Keep)',
    '',
    'Examples:',
    '  i:ARE:BloodCloak:Banana     Replace Blood Cloak with Banana',
    '  i:NO3:PotRoast:LibraryCard  Replace Pot Roast with Library Card',
    '  i:TOP:Turkey-2:Peanuts      Replace 2nd Turkey with Peanuts',
    '  i:CAT:*:Orange              Replace every item in Catacombs with Orange',
    '  i:*:MannaPrism:Potion       Replace every Manna Prism with Potion',
    '  i:*:*:Grapes                Replace every item with Grapes',
    '',
    'Items can be prevented from being randomized to a map location by',
    'prefixing the zone with a hyphen ("-"):',
    '  i:-RCHI:LifeApple:Mace       Never replace the Cave Life Apple with Mace',
    '  i:-*:*:HeartRefresh-Uncurse  Never replace any tile with a Heart Refresh',
    '                               or Uncurse',
    '',
    'If other randomization options follow an item, they must also be',
    'separated from the item with a comma:',
    '  $0 --opt i:TOP:Turkey-2:Peanuts,dpt',
  ].join('\n')

  const rewardsHelp = [
    'Prologue reward randomization can be toggled with the "b" switch.',
    'Rewards may be specified using argument syntax.',
    '',
    'Rewards format:',
    '  b[:<reward>[:<item>]][:...]',
    '',
    'Reward is one of:',
    '  "h" for Heart Refresh',
    '  "n" for Neutron bomb',
    '  "p" for Potion',
    '',
    'Items are specified by removing any non-alphanumeric characters from',
    'their name.',
    '',
    'Examples:',
    '  b:h:MannaPrism   Replace Heart Refresh with Manna Prism',
    '  b:n:PowerofSire  Replace Neutron bomb with Power of Sire',
    '  b:p:BuffaloStar  Replace Potion with Buffalo Star',
    '',
    'Items can be prevented from replacing prologue rewards by prefixing the',
    'reward with a hyphen ("-"):',
    '  b:-h:Uncurse     Never replace Heart Refresh with Uncurse',
    '  b:-n:Turkey-TNT  Never replace Neutron bomb with Turkey or TNT',
    '',
    'If other randomization options follow an item, they must also be',
    'separated from the item with a comma:',
    '  $0 --opt b:h:MannaPrism,dt',
  ].join('\n')

  const relicsHelp = [
    'Relic location randomization can be toggled with the "r" switch, and',
    'custom relic location locks may be specified using argument syntax.',
    '',
    'A relic location lock sets the abilities required to access a relic',
    'location. Each relic location may be guarded by multiple locks, and the',
    'location will be open to the player once they have all abilities',
    'comprising any single lock.',
    '',
    'A location can also specify escape requirements. These are combinations of',
    'abilities, any one of which must be satisified by all progression routes',
    'granting access to the location. This is intended to prevent the player',
    'from accessing an area that they might not have the ability to escape',
    'from. Note that is is possible for the location itself to grant one of the',
    'abilities required to escape from it.',
    '',
    'Relics format:',
    '  r[:[@]<location>[:<ability>[-<ability>...]]'
    + '[+<ability>[-<ability>...]]][:...]',
    '',
    'Relic locations and the abilities they provide are identified by one',
    'letter:',
    '  (' + constants.RELIC.SOUL_OF_BAT + ') Soul of Bat',
    '  (' + constants.RELIC.FIRE_OF_BAT + ') Fire of Bat',
    '  (' + constants.RELIC.ECHO_OF_BAT + ') Echo of Echo',
    '  (' + constants.RELIC.FORCE_OF_ECHO + ') Force of Echo',
    '  (' + constants.RELIC.SOUL_OF_WOLF + ') Soul of Wolf',
    '  (' + constants.RELIC.POWER_OF_WOLF + ') Power of Wolf',
    '  (' + constants.RELIC.SKILL_OF_WOLF + ') Skill of Wolf',
    '  (' + constants.RELIC.FORM_OF_MIST + ') Form of Mist',
    '  (' + constants.RELIC.POWER_OF_MIST + ') Power of Mist',
    '  (' + constants.RELIC.GAS_CLOUD + ') Gas Cloud',
    '  (' + constants.RELIC.CUBE_OF_ZOE + ') Cube of Zoe',
    '  (' + constants.RELIC.SPIRIT_ORB + ') Spirit Orb',
    '  (' + constants.RELIC.GRAVITY_BOOTS + ') Gravity Boots',
    '  (' + constants.RELIC.LEAP_STONE + ') Leap Stone',
    '  (' + constants.RELIC.HOLY_SYMBOL + ') Holy Symbol',
    '  (' + constants.RELIC.FAERIE_SCROLL + ') Faerie Scroll',
    '  (' + constants.RELIC.JEWEL_OF_OPEN + ') Jewel of Open',
    '  (' + constants.RELIC.MERMAN_STATUE + ') Merman Statue',
    '  (' + constants.RELIC.BAT_CARD + ') Bat Card',
    '  (' + constants.RELIC.GHOST_CARD + ') Ghost Card',
    '  (' + constants.RELIC.FAERIE_CARD + ') Faerie Card',
    '  (' + constants.RELIC.DEMON_CARD + ') Demon Card',
    '  (' + constants.RELIC.SWORD_CARD + ') Sword Card',
    '  (' + constants.RELIC.SPRITE_CARD + ') Sprite Card',
    '  (' + constants.RELIC.NOSEDEVIL_CARD + ') Nosedevil Card',
    '  (' + constants.RELIC.HEART_OF_VLAD + ') Heart of Vlad',
    '  (' + constants.RELIC.TOOTH_OF_VLAD + ') Tooth of Vlad',
    '  (' + constants.RELIC.RIB_OF_VLAD + ') Rib of Vlad',
    '  (' + constants.RELIC.RING_OF_VLAD + ') Ring of Vlad',
    '  (' + constants.RELIC.EYE_OF_VLAD + ') Eye of Vlad',
    '  (' + constants.RELIC.SPIKE_BREAKER + ') Spike Breaker',
    '  (' + constants.RELIC.SILVER_RING + ') Silver ring',
    '  (' + constants.RELIC.GOLD_RING + ') Gold ring',
    '  (' + constants.RELIC.HOLY_GLASSES + ') Holy glasses',
    '',
    'Examples:',
    '  r:B:L      Soul of Bat relic location requires only Leap Stone',
    '  r:y:LV-MP  Holy Symbol relic location requires Leap Stone + Gravity',
    '             Boots OR Form of Mist + Power of Mist',
    '',
    'Note that relic location extensions use the name of the item being',
    'replaced as their identifier:',
    '  r:Mormegil:JL-JV  Mormegil location requires Jewel of Open + Leap Stone',
    '                    OR Jewel of Open + Gravity Boots',
    '',
    'Escape requirements follow the ability locks and are separated by a "+":',
    '  r:H:GS+B-LV-MP  Holy Glasses location requires Gold + Silver Rings for',
    '                  access and Soul of Bat, Leap Stone + Gravity Boots, or',
    '                  Mist + Power of Mist for escape.',
    '',
    'Locks for different locations can be specified by separating each',
    'location by a colon:',
    '  r:B:L:y:LV-MP',
    '',
    'Relic locations extension can be specified with the letter "x". Extension',
    'will allow progression to be placed in locations that do not contain',
    'progression in the vanilla game.',
    '',
    'There are three extension modes:',
    '  guarded    Adds Crystal cloak, Mormegil, Dark Blade, and Ring of Arcana',
    '             to the location pool. This is the default extension mode when',
    '             when enabled without an argument.',
    '  spread     Based on guarded, and adds Dragon helm, Shotel, and Staurolite',
    '             to the location pool.',
    '  equipment  Adds remaining equipment tiles to the location pool.',
    '',
    'Extension format:',
    '  x:<mode>',
    '',
    'Examples:',
    '  r:x:guarded    Enables guarded extension mode',
    '  r:x:equipment  Enables equipment extension mode',
    '',
    'Additionally there are items to provide abilities that do not have a',
    'dedicated vanilla location.',
    '  (' + constants.RELIC.THRUST_SWORD + ') Thrust sword',
    '',
    'These ability items can be added to the relic placement logic by',
    'specifying their ability letter:',
    '  r:D:M:D-L  Enable Thrust sword placement and have Form of Mist location',
    '             require a Thrust sword or Leap Stone',
    '',
    'An optional complexity target can specify a set of abilities that are',
    'considered win conditions. A minimum and maximum complexity depth specify',
    'how many relics must be obtained in series to unlock a win condition:',
    '  r:3:LV-MP  Leap Stone + Gravity Boots OR Form of Mist + Power of Mist',
    '             required to complete seed with a minimum depth of .',
    '  r:3-5:SG   Silver + Gold ring required to complete seed with a minimum',
    '             depth of 3 and a maximum depth of 5',
    '',
    'Relics can be placed in an explicit location by prefixing a location with',
    'the "@" symbol. Multiple relics may be specified, however, only one will',
    'be selected for that location at the time of seed generation. Ability',
    'locks and placed relics may be freely mixed in together:',
    '  r:B:L:@B:fe  Soul of Bat location requires Leap Stone and may contain',
    '               either Fire of Bat or Force of Echo',
    '',
    'A placed relic location may also be "empty". To specify an empty location,',
    'include a "0" in the relic list for that location. Note that relic',
    'locations must be extended when allowing a location to be empty:',
    '  r:x:guarded:@B:0    Soul of Bat location is empty',
    '  r:x:guarded:@y:fe0  Holy Symbol location may be empty or contain Fire of',
    '                      Bat or Force of Echo',
    '',
    'Relics may be blocked from being randomized to a location by prefxing it',
    'with a hypen ("-"):',
    '  r:-J:0BLG  Never let Jewel of Open location be empty, or have Soul of',
    '             Bat, Leap Stone, or Gravity Boots',
    '',
    'A relic can be replaced with an arbitrary item by prefixing its ability',
    'with the "=" symbol:',
    '  r:=z:Duplicator  Replace Cube of Zoe with Duplicator',
    '',
    'Placing progression items in vanilla relic locations requires an item in',
    'that zone to be removed. A player may notice a removed item in a zone',
    'and correctly assume that a progression item has been randomized to a',
    'location in that zone. To prevent this leakage of information, the default',
    'behavior of the relic randomizer is to remove at most 3 random items from',
    'every zone containing relics. This behavior can be turned off by including',
    'the string "~r" as an argument:',
    '  r:~r  Disable leak prevention',
    '',
    'If other randomization options follow a lock, they must also be',
    'separated from the lock with a comma:',
    '  $0 --opt r:B:L:y:LG-MP,dpt',
  ].join('\n')

  const writesHelp = [
    'Arbitrary data can be written using the "w" option with argument syntax.',
    '',
    'Write format:',
    '  w:address:value[:address:value[:...]]',
    '',
    'Addresses should be either decimal numbers or "0x"-prefixed hex strings.',
    '',
    'Values are either "0x"-prefixed hex strings or unprefixed hex strings.',
    'Use an unprefixed hex string to specify a string of bytes.',
    'Use a prefixed hex string to specify a number written as little-endian.',
    'The width of the number written is determined by the length of the hex.',
    'To write a character, the hex must be 2 characters. To write a short, the',
    'hex must be 4 characters. To write a word, the hex must be 8 characters.',
    'To write a long, the hex must be 16 characters. A prefixed hex string of',
    'any other character length is erroneous.',
    '',
    'Additionally, random data can be written by specifying a value of "rc" for',
    'a random character (1 byte), "rs" for a random short (2 bytes), "rw" for a',
    'random word (4 bytes), or "rl" for a random long (8 bytes).',
    '',
    'Examples:',
    '  w:0x04c590:0x00                Write the character 0x00 to the address',
    '                                 0x04c590',
    '  w:0x043930c4:0x78b4            Write the value 0x78b4 as a little-endian',
    '                                 short integer to the address 0x043930c4',
    '  w:0x032b08:0x08075180          Write the value 0x08075180 as a little-',
    '                                 endian integer to the address 0x032b08',
    '  w:0x0abb28:0x00:0x0abb2a:0x01  Write the characters 0x00 and 0x01 to the',
    '                                 addresses 0x0abb28 and 0x0abb2a',
    '                                 respectively',
    '  w:0x04389c6c:74657374ff        Write the string 74657374ff to the',
    '                                 address 0x04389c6c',
    '  w:0x04937fb4:rc                Write a random byte to the address',
    '                                 0x04937fb4',
    '  w:0x0456a274:rs                Write 2 random bytes to the address',
    '                                 0x0456a274',
    '  w:0x0456b888:rw                Write 4 random bytes to the address',
    '                                 0x0456b888',
    '  w:0x049f4a98:rl                Write 8 random bytes to the address',
    '                                 0x049f4a98',
    '',
    'If other randomization options follow a write, they must also be separated',
    'from the write with a comma:',
    '  $0 --opt w:0x0abb28:0x00:0x0abb2a:0x01,dpt',
  ].join('\n')

  const tournamentHelp = [
    'Tournament mode applies the following:',
    '- Spoiler log verbosity maximum is 2 (seed and starting equipment).',
    '- The library shop relic is free.',
    '- The clock room statue is always open.',
  ].join('\n')

  const presetHelp = [
    'Presets specify collection of randomization options. A preset is enabled',
    'by using argument syntax.',
    '',
    'Preset format:',
    '  p:<preset>',
    '',
    'This randomizer has several built-in presets:',
  ].concat(presets.filter(function(preset) {
    return !preset.hidden
  }).map(function(preset) {
    return '  ' + preset.id + (preset.id === 'safe' ? ' (default)' : '')
  })).concat([
    '',
    'Use `--help <preset>` for information on a specific preset.',
    '',
    'Examples:',
    '  p:safe        Use Safe preset',
    '  p:empty-hand  Use Empty Hand preset',
    '',
    'When using the `$0` utility, you can use the `--preset` shorthand to',
    'specify a preset:',
    '  $0 -p speedrun  # Use speedrun preset',
    '',
    'Preset options may be overridden by specifying an options string:',
    '  $0 -p adventure --opt d:*:Peanuts-  # Adventure with only Peanut drops',
    '',
    'A special negation syntax can be used in the options string to disable',
    'randomizations that a preset would otherwise enable. To negate a',
    'randomization, precede its letter with a tilde ("~"):',
    '  $0 -p adventure --opt ~m  # Adventure but without music randomization',
  ]).join('\n')

  function presetMetaHelp(preset) {
    const options = preset.options()
    let locations = relics.filter(function(relic) {
      return !relic.extension && relic.ability !== constants.RELIC.THRUST_SWORD
    })
    const extensions = []
    if (typeof(options.relicLocations) === 'object'
      && 'extension' in options.relicLocations) {
      switch (options.relicLocations.extension) {
        // TODO - fallthrough intended?
        case constants.EXTENSION.EQUIPMENT:
          extensions.push(constants.EXTENSION.EQUIPMENT)
        case constants.EXTENSION.SPREAD:
          extensions.push(constants.EXTENSION.SPREAD)
        case constants.EXTENSION.GUARDED:
          extensions.push(constants.EXTENSION.GUARDED)
      }
    }
    const extendedLocations = extension.filter(function(location) {
      return extensions.indexOf(location.extension) !== -1
    })
    locations = locations.concat(extendedLocations)
    locations = locations.map(function(location) {
      let id
      if ('ability' in location) {
        id = location.ability
      } else {
        id = location.name
      }
      return {
        id: id,
        name: location.name,
        ability: location.ability,
      }
    })
    let info = [
      preset.name + ' by ' + preset.author,
      preset.description,
      '',
    ].concat(locations.map(function(location) {
      let label
      if (location.ability) {
        label = '  (' + location.ability + ') ' + location.name.slice(0, 21)
      } else {
        label = '      ' + location.name.slice(0, 21)
      }
      label += Array(28).fill(' ').join('')
      let locks
      let escapes
      if (options.relicLocations[location.id]) {
        locks = options.relicLocations[location.id].filter(function(lock) {
          return lock[0] !== '+'
        })
        escapes = options.relicLocations[location.id].filter(function(lock) {
          return lock[0] === '+'
        }).map(function(lock) {
          return lock.slice(1)
        })
      }
      return label.slice(0, 28) + location.id.replace(/[^a-zA-Z0-9]/g, '') + ':'
        + (locks ? locks.join('-') : '')
        + (escapes && escapes.length ? '+' + escapes.join('-') : '')
    }))
    const keys = Object.getOwnPropertyNames(options.relicLocations)
    const target = keys.filter(function(key) {
      return /^[0-9]+(-[0-9]+)?$/.test(key)
    }).pop()
    if (target) {
      const parts = target.split('-')
      info.push('')
      info.push('  Complexity target: '
        + parts[0] + ' <= depth'
        + (parts.length === 2 ? ' <= ' + parts[1] : ''))
      info.push('  Goals: ' + options.relicLocations[target].join('-'))
    }
    return info.join('\n')
  }

  function displayHelp(yargs) {
    let argv = yargs.argv
    if (!argv.help) {
      yargs.showHelp()
      process.exit()
    }
    const topics = {
      options: optionsHelp,
      drops: dropsHelp,
      equipment: equipmentHelp,
      items: itemsHelp,
      rewards: rewardsHelp,
      relics: relicsHelp,
      writes: writesHelp,
      tournament: tournamentHelp,
      preset: presetHelp,
    }
    const script = path.basename(process.argv[1])
    Object.getOwnPropertyNames(topics).forEach(function(topic) {
      topics[topic] = topics[topic].replace(/\$0/g, script)
    }, {})
    presets.forEach(function(preset) {
      if (!preset.hidden) {
        topics[preset.id] = presetMetaHelp(preset)
      }
    })
    if (argv.help in topics) {
      console.log(topics[argv.help])
      process.exit()
    } else {
      yargs.showHelp()
      console.error('\nUnknown help topic: ')
      process.exit(1)
    }
  }

  const exports = {
    displayHelp: displayHelp
  }
  if (self) {
    self.sotnRando = Object.assign(self.sotnRando || {}, {
      help: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)