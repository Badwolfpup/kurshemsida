import React, { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext'; // Import the hook

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Banner = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Login: React.FC = () => {
  const [inputValue, setInputValue] = useState(''); // Changed to inputValue for clarity
  const [password, setPassword] = useState('');
  const { login } = useUser(); // Get login function from Context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate user type check: if input is 'admin', set as admin, else regular
    const userType = inputValue.trim().toLowerCase() === 'admin' ? 'admin' : 'regular';
    login(userType); // This will update the Context and navigate to main app
  };

  return (
    <Container>
      <Banner>Välkommen till CUL programmeringskurs</Banner>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text" // Changed to text input
          placeholder="Enter 'admin' or anything else" // Updated placeholder
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">Logga in</Button>
      </Form>
    </Container>
  );
};

export default Login;