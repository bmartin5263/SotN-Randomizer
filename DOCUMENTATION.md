# Developer Documentation
Documentation related to the randomizer, the libraries it uses, and the javascript techniques it employs. 

## Randomizer

## Dependencies

## Javascript
Some topics here may seem obvious to seasoned Javascript developers, but for newbies coming from other languages these
are important concepts for understanding the codebase.

### Defaulting values using `||`
The `||` operator can be used to select the first truthy (sometimes) value
```js
let x = undefined || 0;
console.log(x); // logs 0, despite not being truthy

let y = undefined || 'hello' || 0;
console.log(y); // logs hello

let z = undefined || 0 || 188 || 'hello';
console.log(z); // logs 188
```