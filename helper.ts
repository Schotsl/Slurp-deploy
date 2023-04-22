export function generateNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function generateShortcode() {
  const prefixes = [
    "tipsy",
    "buzzed",
    "drunk",
    "sober",
    "spirited",
    "dizzy",
    "boozed",
    "merry",
    "intoxicated",
  ];

  const drinks = [
    "vodka",
    "smirnoff",
    "rum",
    "whiskey",
    "absolut",
    "fireball",
    "bourbon",
    "tequila",
    "jagermeister",
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const alcohol = drinks[Math.floor(Math.random() * drinks.length)];
  const number = generateNumber(100, 999);

  const combined = `${prefix}-${alcohol}-${number}`;
  const capitalized = combined.charAt(0).toUpperCase() + combined.slice(1);

  return capitalized;
}
