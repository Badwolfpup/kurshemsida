import React from 'react';
import './CourseStyles.css';

const JsFunctions: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Functions in JavaScript</h1>
      <p>Functions are reusable blocks of code that perform a specific task. They help organize and modularize your code.</p>

      <h2>Function Declaration</h2>
      <p>Define a function using the <code>function</code> keyword.</p>
      <pre><code>{`function greet(name) {
  return "Hello, " + name;
}
console.log(greet("John"));`}</code></pre>

      <h2>Function Expression</h2>
      <p>Assign a function to a variable.</p>
      <pre><code>{`const greet = function(name) {
  return "Hello, " + name;
};
console.log(greet("Jane"));`}</code></pre>

      <h2>Arrow Functions</h2>
      <p>A concise way to write functions, introduced in ES6.</p>
      <pre><code>{`const greet = (name) => "Hello, " + name;
console.log(greet("Alex"));

// With multiple lines:
const add = (a, b) => {
  return a + b;
};`}</code></pre>

      <h2>Parameters and Arguments</h2>
      <p>Parameters are placeholders in the function definition; arguments are the actual values passed.</p>
      <pre><code>{`function multiply(a, b) {
  return a * b;
}
console.log(multiply(3, 4)); // 12`}</code></pre>

      <h2>Default Parameters</h2>
      <p>Set default values for parameters.</p>
      <pre><code>{`function greet(name = "Guest") {
  return "Hello, " + name;
}
console.log(greet()); // Hello, Guest`}</code></pre>

      <h2>Return Statement</h2>
      <p>Use <code>return</code> to send a value back from the function.</p>
      <pre><code>{`function square(x) {
  return x * x;
}
let result = square(5);
console.log(result); // 25`}</code></pre>

      <h2>Scope</h2>
      <p>Variables declared inside a function are local to that function.</p>
      <pre><code>{`function test() {
  let localVar = "I'm local";
  console.log(localVar);
}
test();
// console.log(localVar); // Error: localVar is not defined`}</code></pre>
    </div>
  );
};

export default JsFunctions;