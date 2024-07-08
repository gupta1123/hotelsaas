import React from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

const Home = () => {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box
        p={8}
        maxW="md"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={useColorModeValue('white', 'gray.700')}
      >
        <Text fontSize="2xl">Welcome to the Hotel Management System</Text>
      </Box>
    </Flex>
  );
};

export default Home;
