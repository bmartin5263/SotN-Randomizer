#!/usr/bin/env node
'use strict'
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const os = require('os')
const Worker = require('worker_threads').Worker
const constants = require('./src/constants')
const errors = require('./src/errors')
const presets = require('./presets')
const randomizeStats = require('./src/randomize_stats')
const randomizeRelics = require('./src/randomize_relics')
const randomizeMusic = require('./src/randomize_music')
const applyAccessibilityPatches = require('./src/accessibility_patches')
const util = require('./src/util')
const help = require('./src/help')
let version = require('./package').version

let eccEdcCalc
const yargs = require('yargs')
  .strict()
  .usage('$0 [options] [url]')
  .option('in-bin', {
    alias: 'i',
    describe: 'Path to vanilla .bin file',
    conflicts: ['no-seed'],
    type: 'string',
    requiresArg: true,
  })
  .option('out', {
    alias: 'o',
    describe: [
      'If used with `in-bin` option, path to write randomized .bin file, ',
      'otherwise, path to write PPF file',
    ].join(''),
    type: 'string',
    requiresArg: true,
  })
  .option('seed', {
    alias: 's',
    describe: 'Randomization seed',
    type: 'string',
    requiresArg: true,
  })
  .option('options', {
    alias: 'opt',
    describe: 'Randomizations (`--help options`)',
    type: 'string',
    requiresArg: true,
  })
  .option('expect-checksum', {
    alias: 'e',
    describe: 'Verify checksum',
    conflicts: ['no-seed'],
    type: 'string',
    requiresArg: true,
  })
  .option('url', {
    alias: 'u',
    description: 'Print seed url using optional base',
    type: 'string',
  })
  .option('race', {
    alias: 'r',
    describe: 'Same as -uvv',
    type: 'boolean',
  })
  .option('preset', {
    alias: 'p',
    describe: 'Use preset',
    type: 'string',
    requiresArg: true,
  })
  .option('preset-file', {
    alias: 'f',
    describe: 'Use preset file',
    type: 'string',
    requiresArg: true,
    conflicts: ['preset'],
  })
  .option('complexity', {
    alias: 'c',
    describe: 'Shortcut to adjust seed complexity',
    type: 'number',
    requiresArg: true,
  })
  .option('tournament', {
    alias: 't',
    describe: 'Enable tournament mode (`--help tournament`)',
    type: 'boolean',
  })
  .option('disable-accessibility-patches', {
    alias: 'a',
    describe: 'Disable accessibility patches',
    type: 'boolean',
  })
  .option('no-seed', {
    alias: 'n',
    describe: 'Disable seed generation',
    conflicts: ['in-bin', 'expect-checksum'],
    type: 'boolean',
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Verbosity level',
    type: 'count',
    default: undefined,
  })
  .option('quiet', {
    alias: 'q',
    describe: 'Suppress output',
    conflicts: 'verbose',
    type: 'boolean',
  })
  .option('compat', {
    type: 'string',
    requiresArg: true,
  })
  .hide('compat')
  .help(false)
  .option('help', {
    alias: 'h',
    describe: 'Show help',
    type: 'string',
  })

function abort(message) {
  yargs.showHelp()
  if (typeof message !== 'undefined') {
    console.error('\n' + message)
  }
  process.exit(1)
}

const argv = yargs.argv
let options
let seed
let baseUrl
let expectChecksum
let haveChecksum
// Require at least one argument.
if (process.argv.length < 3) {
  abort('At least 1 argument or option required')
}
// Check for help.
if ('help' in argv) {
  help.displayHelp(yargs)
}
if (argv.compat) {
  version = argv.compat
}
// Check for seed string.
if ('seed' in argv) {
  if ('noSeed' in argv) {
    abort('Cannot specify seed if seed generation is disabled')
  }
  seed = argv.seed.toString()
}
// Check for base url.
if (argv.url) {
  baseUrl = argv.url
}
// If seed generation is disabled, assume url output.
if (argv.noSeed) {
  argv.url = ''
}
// Check for expected checksum.
if ('expectChecksum' in argv) {
  if (!('seed' in argv) && !argv._[0]) {
    abort('Cannot specify checksum if not providing seed')
  }
  if (!argv.expectChecksum.match(/^[0-9a-f]{1,3}$/)) {
    abort('Invalid checksum string')
  }
  expectChecksum = parseInt(argv.expectChecksum, 16)
  haveChecksum = true
}
// Check for randomization string.
if ('options' in argv) {
  try {
    options = util.optionsFromString(argv.options)
  } catch (e) {
    abort(e.message)
  }
}
// Check for preset.
if ('preset' in argv) {
  try {
    if (options && 'preset' in options && options.preset !== argv.preset) {
      abort('Command line option preset conflits with options string preset')
    }
    options = Object.assign(
      options || {},
      util.optionsFromString('p:' + argv.preset)
    )
  } catch (e) {
    abort(e.message)
  }
}
// Check for preset file.
if ('presetFile' in argv) {
  if (options && 'preset' in options) {
    abort('Cannot specify options string preset when using a preset file')
  }
  const relative = path.relative(path.dirname(__filename), argv.presetFile)
  const preset = require('./' + relative)
  options = Object.assign(
    options || {},
    util.PresetBuilder.fromJSON(preset).build().options()
  )
}
// If a preset and an options string are specified, determine if the options
// are just duplicate options of the preset.
if (options && 'preset' in options
    && Object.getOwnPropertyNames(options).length > 1) {
  try {
    const applied = util.Preset.options(options)
    const preset = util.presetFromName(options.preset)
    if (util.optionsToString(preset.options())
        === util.optionsToString(applied)) {
      // Options string has duplicative values, so just make the options
      // specifying the preset name.
      options = {preset: preset.id}
    } else {
      // Options string overrides the preset, so use the applied options.
      options = applied
    }
  } catch (err) {
    abort(err.message)
  }
}
// Assume safe if negations are specified without a preset.
if (options) {
  const copy = Object.assign({}, options)
  Object.getOwnPropertyNames(copy).forEach(function(opt) {
    if (copy[opt] === false) {
      delete copy[opt]
    }
  })
  if (Object.getOwnPropertyNames(copy).length === 0) {
    options.preset = 'safe'
  }
}

// Check for seed url.
if (argv._[0]) {
  if ('noSeed' in argv) {
    abort('Cannot specify url if seed generation is disabled')
  }
  if ('presetFile' in argv) {
    abort('Cannot specify url if using a preset file')
  }
  let url
  try {
    url = util.optionsFromUrl(argv._[0])
    argv.race = true
    options = url.options
    seed = url.seed
    expectChecksum = url.checksum
    if (expectChecksum) {
      haveChecksum = true
    }
  } catch (e) {
    abort('Invalid url')
  }
  if (seed === null) {
    abort('Url does not contain seed')
  }
  // Ensure seeds match if given using --seed.
  if ('seed' in argv && argv.seed.toString() !== seed) {
    abort('Argument seed is not url seed')
  }
  // Ensure randomizations match if given using --options.
  const optionStr = util.optionsToString(options)
  if (('options' in argv && argv.options !== optionStr)
      || ('preset' in argv && 'p:' + argv.preset !== optionStr)) {
    abort('Argument randomizations are not url randomizations')
  }
  // Ensure checksum match if given using --expect-checksum.
  if ('expectChecksum' in argv && url.checksum != expectChecksum) {
    abort('Argument checksum is not url checksum')
  }
}
// Set options for --race.
if (argv.race) {
  argv.url = ''
  if (argv.verbose === undefined) {
    argv.verbose = 2
  }
}
// Suppress output if quiet argument specified.
if (argv.quiet) {
  argv.verbose = 0
}
// Create default options if none provided.
if (typeof(seed) === 'undefined' && !argv.noSeed) {
  seed = (new Date()).getTime().toString()
}
if (!options) {
  options = util.optionsFromString(constants.defaultOptions)
}
// Check for complexity setting.
if ('complexity' in argv) {
  let applied = Object.assign({}, options)
  // Check for preset.
  if ('preset' in applied) {
    applied = util.Preset.options(applied)
  } else if (!('relicLocations' in options)) {
    applied = util.Preset.options(Object.assign({preset: 'safe'}, options))
  }
  if (typeof applied.relicLocations !== 'object') {
    if (applied.relicLocations) {
      // Inherit safe relic locations.
      const logic = util.presetFromName('safe').options().relicLocations
      applied.relicLocations = logic
    } else {
      abort('Relic location randomization must be enabled to set complexity')
    }
  }
  // Get seed goals.
  let complexity = Object.getOwnPropertyNames(applied.relicLocations).filter(
    function(key) {
      return /^[0-9]+$/.test(key)
    }
  )
  if (complexity.length) {
    complexity = complexity.pop()
    if (parseInt(complexity) !== argv.complexity) {
      const goals = applied.relicLocations[complexity]
      delete applied.relicLocations[complexity]
      applied.relicLocations[argv.complexity] = goals
      options = applied
    }
  } else {
    abort('Completion goals must be preset to set complexity')
  }
}
// Enable tournament mode if specified.
if (argv.tournament) {
  options.tournamentMode = true
}
// Set misc options.
if ('verbose' in argv) {
  options.verbose = argv.verbose
}
const info = util.newInfo()
// Add seed to log info if not provided through command line.
if (!argv.noSeed && (!('url' in argv) || argv._[0])) {
  info[1]['Seed'] = seed
}
let fd
let size
// Read bin file if provided.
if ('inBin' in argv) {
  eccEdcCalc = require('./src/ecc-edc-recalc-js')
  let digest
  if (!('out' in argv)) {
    fd = fs.openSync(argv.inBin, 'r+')
    size = fs.fstatSync(fd).size
    const bin = Buffer.alloc(size)
    fs.readSync(fd, bin, 0, size)
    digest = crypto.createHash('sha256').update(bin).digest()
  } else {
    fd = fs.readFileSync(argv.inBin)
    size = fd.length
    digest = crypto.createHash('sha256').update(fd).digest()
  }
  if (digest.toString('hex') !== constants.digest) {
    console.error('Error: Disc image is not a valid or vanilla backup.')
    process.exit(1)
  }
}

(async function randomize() {
  try {
    let check
    let checksum
    if (!argv.noSeed) {
      check = new util.checked(typeof(fd) === 'object' ? undefined : fd)
      let applied
      try {
        // Check for overriding preset.
        let override
        for (let preset of presets) {
          if (preset.override) {
            applied = preset.options()
            override = true
            break
          }
        }
        // Get user specified options.
        if (!override) {
          applied = util.Preset.options(options)
        }
      } catch (err) {
        abort(err.message)
      }
      try {
        let rng
        let result
        // Randomize stats.
        rng = new require('seedrandom')(util.saltSeed(
          version,
          options,
          seed,
          0,
        ))
        result = randomizeStats(rng, applied)
        const newNames = result.newNames
        check.apply(result.data)
        // Randomize relics.
        const cores = os.cpus().length
        const workers = Array(util.workerCountFromCores(cores))
        for (let i = 0; i < workers.length; i++) {
          workers[i] = new Worker('./src/worker.js')
        }
        result = await util.randomizeRelics(
          version,
          applied,
          options,
          seed,
          newNames,
          workers,
          4,
        )
        util.mergeInfo(info, result.info)
        // Write relics mapping.
        rng = new require('seedrandom')(util.saltSeed(
          version,
          options,
          seed,
          1,
        ))
        result = randomizeRelics.writeRelics(
          rng,
          applied,
          result,
          newNames,
        )
        check.apply(result.data)
        // Randomize items.
        result = await util.randomizeItems(
          version,
          applied,
          options,
          seed,
          new Worker('./src/worker.js'),
          2,
          result.items,
          newNames,
        )
        check.apply(result.data)
        util.mergeInfo(info, result.info)
        // Randomize music.
        rng = new require('seedrandom')(util.saltSeed(
          version,
          options,
          seed,
          3,
        ))
        check.apply(randomizeMusic(rng, applied))
        if (options.tournamentMode) {
          // Apply tournament mode patches.
          check.apply(util.applyTournamentModePatches())
        }
        // Apply writes.
        check.apply(util.applyWrites(rng, applied))
      } catch (err) {
        console.error('Seed: ' + seed)
        if (errors.isError(err)) {
          console.error('Error: ' + err.message)
        } else {
          console.error(err.stack)
        }
        process.exit(1)
      }
      util.setSeedText(
        check,
        seed,
        version,
        options.preset,
        options.tournamentMode,
      )
      checksum = await check.sum()
      // Verify expected checksum matches actual checksum.
      if (haveChecksum && expectChecksum !== checksum) {
        console.error('Checksum mismatch.')
        process.exit(1)
      }
    }
    if (!argv.disableAccessibilityPatches) {
      // Apply accessibility patches.
      check.apply(applyAccessibilityPatches())
    }
    // Show url if not provided as arg.
    if ('url' in argv && !argv._[0] && !argv.quiet) {
      console.log(util.optionsToUrl(
        version,
        options,
        checksum || '',
        seed || '',
        baseUrl,
      ))
    }
    // Print spoilers.
    if (argv.verbose > 0) {
      let verbose = argv.verbose
      if (options.tournamentMode && argv.verbose >= 2) {
        verbose = 2
      }
      const text = util.formatInfo(info, verbose)
      if (text.length) {
        console.log(text)
      }
    }
    if (!argv.noSeed) {
      if ('out' in argv) {
        if ('inBin' in argv) {
          // If is not an in-place randomization, apply writes to the buffer
          // containing the disc image bytes.
          const writer = new util.checked(fd)
          writer.apply(check)
        } else {
          // Otherwise, write patch file.
          const patch = check.toPatch(
            seed,
            options.preset,
            options.tournamentMode,
          )
          fs.writeFileSync(argv.out, patch)
        }
      }
      // Write error detection codes.
      if (fd) {
        eccEdcCalc(fd, size, false)
      }
      // Write randomized bin.
      if (typeof(fd) === 'object') {
        fs.writeFileSync(argv.out, fd)
      }
    }
  } finally {
    if (typeof(fd) === 'number') {
      fs.closeSync(fd)
    }
  }
})()
