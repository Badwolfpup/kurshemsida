import React from 'react';
import './CourseStyles.css';

const JsArrays: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Arrays in JavaScript</h1>
      <p>Arrays are ordered collections of items. They can store multiple values in a single variable.</p>

      <h2>Creating Arrays</h2>
      <pre><code>{`let fruits = ["apple", "banana", "cherry"];
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, "hello", true];`}</code></pre>

      <h2>Accessing Elements</h2>
      <p>Use index (starting from 0) to access elements.</p>
      <pre><code>{`console.log(fruits[0]); // "apple"
console.log(fruits[2]); // "cherry"`}</code></pre>

      <h2>Array Methods</h2>
      <h3>Adding Elements</h3>
      <pre><code>{`fruits.push("orange"); // Add to end
fruits.unshift("grape"); // Add to beginning
console.log(fruits); // ["grape", "apple", "banana", "cherry", "orange"]`}</code></pre>

      <h3>Removing Elements</h3>
      <pre><code>{`fruits.pop(); // Remove from end
fruits.shift(); // Remove from beginning
console.log(fruits); // ["apple", "banana", "cherry"]`}</code></pre>

      <h3>Iterating Over Arrays</h3>
      <pre><code>{`fruits.forEach(fruit => console.log(fruit));
// Or using for loop
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}`}</code></pre>

      <h3>Common Methods</h3>
      <pre><code>{`let numbers = [1, 2, 3, 4, 5];
console.log(numbers.length); // 5
console.log(numbers.indexOf(3)); // 2
console.log(numbers.slice(1, 3)); // [2, 3]
console.log(numbers.splice(1, 2)); // Removes 2 elements starting from index 1
console.log(numbers.join("-")); // "1-4-5"`}</code></pre>

      <h2>Multidimensional Arrays</h2>
      <pre><code>{`let matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];
console.log(matrix[1][2]); // 6`}</code></pre>
    </div>
  );
};

export default JsArrays;