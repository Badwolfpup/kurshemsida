import React from 'react';
import './CourseStyles.css'; // Assuming shared CSS

const JsConditionals: React.FC = () => {
  return (
    <div className="course-page">
      <h1>Conditionals in JavaScript</h1>
      <p>Conditionals allow you to execute different blocks of code based on whether a condition is true or false. The most common conditional is the <code>if</code> statement.</p>

      <h2>If Statement</h2>
      <p>The <code>if</code> statement checks a condition and executes the code inside the block if the condition is true.</p>
      <pre><code>{`if (age >= 18) {
  console.log("You are an adult.");
}`}</code></pre>

      <h2>If-Else Statement</h2>
      <p>Use <code>else</code> to execute code when the condition is false.</p>
      <pre><code>{`if (age >= 18) {
  console.log("You are an adult.");
} else {
  console.log("You are a minor.");
}`}</code></pre>

      <h2>Else If Statement</h2>
      <p>For multiple conditions, use <code>else if</code>.</p>
      <pre><code>{`if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 80) {
  console.log("Grade: B");
} else if (score >= 70) {
  console.log("Grade: C");
} else {
  console.log("Grade: F");
}`}</code></pre>

      <h2>Ternary Operator</h2>
      <p>A shorthand for simple if-else: <code>condition ? trueValue : falseValue</code>.</p>
      <pre><code>{`let message = age >= 18 ? "Adult" : "Minor";
console.log(message);`}</code></pre>

      <h2>Switch Statement</h2>
      <p>Use <code>switch</code> for multiple cases based on a single value.</p>
      <pre><code>{`switch (day) {
  case "Monday":
    console.log("Start of the week");
    break;
  case "Friday":
    console.log("Almost weekend");
    break;
  default:
    console.log("Regular day");
}`}</code></pre>
    </div>
  );
};

export default JsConditionals;