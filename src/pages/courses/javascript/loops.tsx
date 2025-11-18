import React from 'react';
import './CourseStyles.css';

const JsLoops: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Loops in JavaScript</h1>
      <p>Loops allow you to repeat a block of code multiple times. There are several types of loops in JavaScript.</p>

      <h2>For Loop</h2>
      <p>The <code>for</code> loop is used when you know how many times to iterate.</p>
      <pre><code>{`for (let i = 0; i < 5; i++) {
  console.log(i);
}`}</code></pre>

      <h2>While Loop</h2>
      <p>The <code>while</code> loop runs as long as the condition is true.</p>
      <pre><code>{`let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}`}</code></pre>

      <h2>Do-While Loop</h2>
      <p>The <code>do-while</code> loop executes at least once, then checks the condition.</p>
      <pre><code>{`let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);`}</code></pre>

      <h2>For-In Loop</h2>
      <p>Used to iterate over object properties.</p>
      <pre><code>{`let person = {name: "John", age: 30};
for (let key in person) {
  console.log(key + ": " + person[key]);
}`}</code></pre>

      <h2>For-Of Loop</h2>
      <p>Used to iterate over iterable objects like arrays.</p>
      <pre><code>{`let fruits = ["apple", "banana", "cherry"];
for (let fruit of fruits) {
  console.log(fruit);
}`}</code></pre>

      <h2>Breaking Out of Loops</h2>
      <p>Use <code>break</code> to exit a loop early, or <code>continue</code> to skip to the next iteration.</p>
      <pre><code>{`for (let i = 0; i < 10; i++) {
  if (i === 5) break;
  console.log(i);
}`}</code></pre>
    </div>
  );
};

export default JsLoops;