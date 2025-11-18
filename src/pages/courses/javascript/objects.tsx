import React from 'react';
import './CourseStyles.css';

const JsObjects: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Objects in JavaScript</h1>
      <p>Objects are collections of key-value pairs. They represent real-world entities with properties and methods.</p>

      <h2>Creating Objects</h2>
      <pre><code>{`let person = {
  name: "John",
  age: 30,
  city: "New York"
};

// Or using constructor
let car = new Object();
car.make = "Toyota";
car.model = "Camry";`}</code></pre>

      <h2>Accessing Properties</h2>
      <p>Use dot notation or bracket notation.</p>
      <pre><code>{`console.log(person.name); // "John"
console.log(person["age"]); // 30

// Bracket notation for dynamic keys
let key = "city";
console.log(person[key]); // "New York"`}</code></pre>

      <h2>Adding and Modifying Properties</h2>
      <pre><code>{`person.job = "Developer"; // Add new property
person.age = 31; // Modify existing property
console.log(person);`}</code></pre>

      <h2>Methods</h2>
      <p>Functions inside objects are called methods.</p>
      <pre><code>{`let person = {
  name: "John",
  greet: function() {
    return "Hello, " + this.name;
  }
};
console.log(person.greet()); // "Hello, John"`}</code></pre>

      <h2>Object Methods</h2>
      <h3>Object.keys()</h3>
      <pre><code>{`console.log(Object.keys(person)); // ["name", "age", "city", "job"]`}</code></pre>

      <h3>Object.values()</h3>
      <pre><code>{`console.log(Object.values(person)); // ["John", 31, "New York", "Developer"]`}</code></pre>

      <h3>Object.entries()</h3>
      <pre><code>{`console.log(Object.entries(person)); // [["name", "John"], ["age", 31], ...]`}</code></pre>

      <h2>Constructor Functions</h2>
      <p>Use constructor functions to create multiple similar objects.</p>
      <pre><code>{`function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    return "Hello, " + this.name;
  };
}
let john = new Person("John", 30);
console.log(john.greet()); // "Hello, John"`}</code></pre>

      <h2>Prototypes</h2>
      <p>Objects inherit properties from their prototype.</p>
      <pre><code>{`Person.prototype.species = "Human";
console.log(john.species); // "Human"`}</code></pre>
    </div>
  );
};

export default JsObjects;