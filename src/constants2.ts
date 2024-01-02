(function(self: any) {

  type MemoryAddress = number;
  type ZoneId = number;

  const devBaseUrl = 'https://dev.sotn.io/'
  const defaultOptions = 'p:safe'

  const optionsUrls = {
    'p:safe': 'https://sotn.io/',
    'p:adventure': 'https://a.sotn.io/',
    'p:casual': 'https://c.sotn.io/',
    'p:speedrun': 'https://s.sotn.io/',
    'p:glitch': 'https://g.sotn.io/',
    'p:scavenger': 'https://sc.sotn.io/',
    'p:empty-hand': 'https://eh.sotn.io/',
    'p:og': 'https://og.sotn.io/',
    'p:gem-farmer': 'https://gf.sotn.io/',

    // Tournament mode URLs
    'tp:safe': 'https://t.sotn.io/',
    'tp:adventure': 'https://a.t.sotn.io/',
    'tp:casual': 'https://c.t.sotn.io/',
    'tp:speedrun': 'https://s.t.sotn.io/',
    'tp:glitch': 'https://g.t.sotn.io/',
    'tp:scavenger': 'https://sc.t.sotn.io/',
    'tp:empty-hand': 'https://eh.t.sotn.io/',
    'tp:og': 'https://og.t.sotn.io/',
    'tp:gem-farmer': 'https://gf.t.sotn.io/',
  }

  class ItemType {
    name: string
    value: number

    static HEART = new ItemType("HEART", 0);
    static GOLD = new ItemType("GOLD", 1);
    static SUBWEAPON = new ItemType("SUBWEAPON", 2);
    static POWERUP = new ItemType("POWERUP", 3);
    static WEAPON1 = new ItemType("WEAPON1", 4);
    static WEAPON2 = new ItemType("WEAPON2", 5);
    static SHIELD = new ItemType("SHIELD", 6);
    static HELMET = new ItemType("HELMET", 7);
    static ARMOR = new ItemType("ARMOR", 8);
    static CLOAK = new ItemType("CLOAK", 9);
    static ACCESSORY = new ItemType("ACCESSORY", 10);
    static USABLE = new ItemType("USABLE", 11);

    constructor(name: string, value: number) {
      this.name = name;
      this.value = value;
    }

    static names(): string[] {
      return Object.keys(ItemType)
        .map(k => (ItemType as any)[k].name);
    }
  }

  class Zone {
    name: string;
    id: ZoneId;
    pos: MemoryAddress;
    len: number;
    items?: MemoryAddress;

    static ST0 = new Zone({
      name: "ST0",
      id: 0,
      pos: 0x0533efc8,
      len: 271812,
      items: 0x0a60,
    });
    static ARE = new Zone({
      name: "ARE",
      id: 1,
      pos: 0x043c2018,
      len: 352636,
      items: 0x0fe8,
    });
    static CAT = new Zone("CAT", 2);
    static CEN = new Zone("CEN", 3);
    static CHI = new Zone("CHI", 4);
    static DAI = new Zone("DAI", 5);
    static DRE = new Zone("DRE", 6);
    static LIB = new Zone("LIB", 7);
    static NO0 = new Zone("NO0", 8);
    static NO1 = new Zone("NO1", 9);
    static NO2 = new Zone("NO2", 10);
    static NO3 = new Zone("NO3", 11);
    static NP3 = new Zone("NP3", 12);
    static NO4 = new Zone("NO4", 13);
    static NZ0 = new Zone("NZ0", 14);
    static NZ1 = new Zone("NZ1", 15);
    static TOP = new Zone("TOP", 16);
    static WRP = new Zone("WRP", 17);
    static RARE = new Zone("RARE", 18);
    static RCAT = new Zone("RCAT", 19);
    static RCEN = new Zone("RCEN", 20);
    static RCHI = new Zone("RCHI", 21);
    static RDAI = new Zone("RDAI", 22);
    static RLIB = new Zone("RLIB", 23);
    static RNO0 = new Zone("RNO0", 24);
    static RNO1 = new Zone("RNO1", 25);
    static RNO2 = new Zone("RNO2", 26);
    static RNO3 = new Zone("RNO3", 27);
    static RNO4 = new Zone("RNO4", 28);
    static RNZ0 = new Zone("RNZ0", 29);
    static RNZ1 = new Zone("RNZ1", 30);
    static RTOP = new Zone("RTOP", 31);
    static RWRP = new Zone("RWRP", 32);
    static BO0 = new Zone("BO0", 33);
    static BO1 = new Zone("BO1", 34);
    static BO2 = new Zone("BO2", 35);
    static BO3 = new Zone("BO3", 36);
    static BO4 = new Zone("BO4", 37);
    static BO5 = new Zone("BO5", 38);
    static BO6 = new Zone("BO6", 39);
    static BO7 = new Zone("BO7", 40);
    static RBO0 = new Zone("RBO0", 41);
    static RBO1 = new Zone("RBO1", 42);
    static RBO2 = new Zone("RBO2", 43);
    static RBO3 = new Zone("RBO3", 44);
    static RBO4 = new Zone("RBO4", 45);
    static RBO5 = new Zone("RBO5", 46);
    static RBO6 = new Zone("RBO6", 47);
    static RBO7 = new Zone("RBO7", 48);
    static RBO8 = new Zone("RBO8", 49);

    constructor(args: {name: string, id: ZoneId, pos: number, len: number, items?: number}) {
      this.name = args.name;
      this.id = args.id;
      this.pos = args.pos;
      this.len = args.len;
      this.items = args.items;
    }

    static names(): string[] {
      return Object.keys(Zone)
        .map(k => (Zone as any)[k].name);
    }
  }

  class RelicSymbol {
    value: string;

    static SOUL_OF_BAT = new RelicSymbol('B');
    static FIRE_OF_BAT = new RelicSymbol('f');
    static ECHO_OF_BAT = new RelicSymbol('E');
    static FORCE_OF_ECHO = new RelicSymbol('e');
    static SOUL_OF_WOLF = new RelicSymbol('W');
    static POWER_OF_WOLF = new RelicSymbol('p');
    static SKILL_OF_WOLF = new RelicSymbol('s');
    static FORM_OF_MIST = new RelicSymbol('M');
    static POWER_OF_MIST = new RelicSymbol('P');
    static GAS_CLOUD = new RelicSymbol('c');
    static CUBE_OF_ZOE = new RelicSymbol('z');
    static SPIRIT_ORB = new RelicSymbol('o');
    static GRAVITY_BOOTS = new RelicSymbol('V');
    static LEAP_STONE = new RelicSymbol('L');
    static HOLY_SYMBOL = new RelicSymbol('y');
    static FAERIE_SCROLL = new RelicSymbol('l');
    static JEWEL_OF_OPEN = new RelicSymbol('J');
    static MERMAN_STATUE = new RelicSymbol('U');
    static BAT_CARD = new RelicSymbol('b');
    static GHOST_CARD = new RelicSymbol('g');
    static FAERIE_CARD = new RelicSymbol('a');
    static DEMON_CARD = new RelicSymbol('d');
    static SWORD_CARD = new RelicSymbol('w');
    static SPRITE_CARD = new RelicSymbol('t');
    static NOSEDEVIL_CARD = new RelicSymbol('n');
    static HEART_OF_VLAD = new RelicSymbol('A');
    static TOOTH_OF_VLAD = new RelicSymbol('T');
    static RIB_OF_VLAD = new RelicSymbol('R');
    static RING_OF_VLAD = new RelicSymbol('N');
    static EYE_OF_VLAD = new RelicSymbol('I');
    static GOLD_RING = new RelicSymbol('G');
    static SILVER_RING = new RelicSymbol('S');
    static SPIKE_BREAKER = new RelicSymbol('K');
    static HOLY_GLASSES = new RelicSymbol('H');
    static THRUST_SWORD = new RelicSymbol('D');

    constructor(value: string) {
      console.assert(value.length == 1, "Expected symbol length to be 1 character: " + value)
      this.value = value;
    }

  }

  const exports = {
    RelicSymbol: RelicSymbol
  }

  if (self) {
    self.sotnRando = Object.assign(self.sotnRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }

})(typeof(self) !== 'undefined' ? self : null)