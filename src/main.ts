function assert(cond: boolean, message: string) {
  if (!cond) {
    console.log("Assertion failed: " + message);
    process.exit(1);
  }
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

  static {
    console.log("static block");
    let keys = Object.keys(ItemType);

    let names = new Set<string>();
    keys.map(k => (ItemType as any)[k].name).forEach(k => names.add(k));
    assert(names.size == keys.length, "Duplicate ItemType.name")
  }
}

console.log("Starting");
console.log(Object.keys(ItemType));