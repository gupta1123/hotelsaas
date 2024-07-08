import React from 'react';
import { Box, VStack, Link, useColorModeValue, Text, Icon,Flex } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaDesktop, FaList, FaBed, FaCog, FaBook, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import { MdCleaningServices } from 'react-icons/md';

const Sidebar = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const activeLinkColor = useColorModeValue('teal.700', 'teal.300');
  const hoverColor = useColorModeValue('teal.600', 'teal.200');
  const activeBgColor = useColorModeValue('white', 'gray.700');

  const navItems = [
    { name: 'Frontdesk', path: '/frontdesk', icon: FaDesktop },
    { name: 'Create Booking', path: '/bookings', icon: FaCalendarAlt },
    { name: 'Booking List', path: '/booking-list', icon: FaList },
    { name: 'Housekeeping', path: '/housekeeping', icon: MdCleaningServices },
    { name: 'Rooms', path: '/rooms', icon: FaBed },
    { name: 'Ledgers', path: '/ledgers', icon: FaBook },
    { name: 'Report', path: '/report', icon: FaChartBar },
    { name: 'Settings', path: '/settings', icon: FaCog },


  ];

  return (
    <Box
      position="fixed"
      left={0}
      width="250px"
      height="100%"
      bg={bgColor}
      p={6}
      boxShadow="lg"
      borderRight="1px solid"
      borderRightColor={useColorModeValue('gray.300', 'gray.600')}
    >
      <Text fontSize="2xl" fontWeight="extrabold" mb={10} color={activeLinkColor}>
        Hotel Management
      </Text>
      <VStack align="stretch" spacing={2}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            as={RouterLink}
            to={item.path}
            fontWeight="medium"
            color={location.pathname === item.path ? activeLinkColor : linkColor}
            bg={location.pathname === item.path ? activeBgColor : 'transparent'}
            p={3}
            borderRadius="md"
            transition="all 0.3s"
            _hover={{ textDecoration: 'none', color: hoverColor, bg: activeBgColor, transform: 'translateX(5px)' }}
            _activeLink={{ color: activeLinkColor, bg: activeBgColor }}
          >
            <Flex align="center">
              <Icon as={item.icon} mr={3} />
              {item.name}
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;