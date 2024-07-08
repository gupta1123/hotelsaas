import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useColorModeValue, Text } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

const Login = ({ setIsLoggedIn, setAuthToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const history = useHistory();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login with", username, password);
    const loginData = {
      username: username,
      password: password,
    };
    console.log("Payload for Login:", loginData);
  
    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        if (errorData.includes("Bad credentials")) {
          setLoginError("Incorrect username or password. Please try again.");
        } else {
          setLoginError("Login failed due to server error. Please try again later.");
        }
        return;
      }
  
      setLoginError('');
      const responseData = await response.text();
      console.log("Login Response:", responseData);
      const [userRole, token] = responseData.split(' ');
      localStorage.setItem('userRole', userRole);

      console.log("User Role:", userRole);
      setAuthToken(token);

      console.log('user', userRole);
      const expiryTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
      localStorage.setItem('authToken', token);
      localStorage.setItem('expiryTime', expiryTime.toString());

      setIsLoggedIn(true);
      history.push('/frontdesk');
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login. Please try again.");
    }
  };

  return (
    <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box width="300px" p={6} borderRadius="md" boxShadow="md" bg={bgColor}>
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color={textColor}>Username</FormLabel>
              <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
              />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Password</FormLabel>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </FormControl>
            {loginError && (
              <Text color="red.500" fontSize="sm">
                {loginError}
              </Text>
            )}
            <Button type="submit" colorScheme="teal" width="full">
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Login;