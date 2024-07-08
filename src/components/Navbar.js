import React from 'react';
import { Box, Flex, Button, useColorMode, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ handleLogout }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      bg={bgColor} 
      px={4} 
      position="fixed" 
      width="calc(100% - 250px)" 
      right="0" 
      top="0" 
      zIndex="sticky"
      boxShadow="sm"
      borderBottom="1px solid"
      borderBottomColor={borderColor}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'flex-end'}>
        <Button onClick={toggleColorMode} mr={4} variant="ghost">
          <Icon as={colorMode === "light" ? FaMoon : FaSun} />
        </Button>
        <Button onClick={handleLogout} colorScheme="red" variant="outline" leftIcon={<FaSignOutAlt />}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default Navbar;